import { execFileSync } from "node:child_process";
import path from "node:path";
import { writeFile } from "node:fs/promises";

function runCommand(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function slugToCamelCase(slug) {
  const [first = "", ...rest] = slug.split("-");
  return `${first}${rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("")}`;
}

function runnerSource(snippetPath, slug) {
  const functionName = slugToCamelCase(slug);

  return `
const std = @import("std");
const algo = @import(${JSON.stringify(snippetPath)});

fn loadValues(allocator: std.mem.Allocator, dataset_path: []const u8) !std.ArrayList(i32) {
    var values = std.ArrayList(i32).init(allocator);
    const contents = try std.fs.cwd().readFileAlloc(allocator, dataset_path, 1024 * 1024);
    defer allocator.free(contents);

    var lines = std.mem.tokenizeScalar(u8, contents, '\\n');
    while (lines.next()) |line| {
        if (line.len == 0) continue;
        try values.append(try std.fmt.parseInt(i32, std.mem.trim(u8, line, " \\r\\t"), 10));
    }

    return values;
}

fn isSorted(values: []const i32) bool {
    var index: usize = 1;
    while (index < values.len) : (index += 1) {
        if (values[index - 1] > values[index]) {
            return false;
        }
    }
    return true;
}

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    var args = try std.process.argsWithAllocator(allocator);
    defer args.deinit();
    _ = args.next();
    const dataset_path = args.next().?;
    const mode = args.next().?;

    var values = try loadValues(allocator, dataset_path);
    defer values.deinit();

    const started = std.time.nanoTimestamp();
    const result = try algo.${functionName}(allocator, values.items);
    defer allocator.free(result);
    const duration_ms = @as(f64, @floatFromInt(std.time.nanoTimestamp() - started)) / 1_000_000.0;

    if (!isSorted(result)) {
        return error.NotSorted;
    }

    var stdout = std.io.getStdOut().writer();
    if (std.mem.eql(u8, mode, "full")) {
        try stdout.print("{{\\"durationMs\\":{d},\\"result\\":[", .{duration_ms});
        for (result, 0..) |value, index| {
            if (index > 0) {
                try stdout.writeAll(",");
            }
            try stdout.print("{d}", .{value});
        }
        try stdout.writeAll("]}\\n");
    } else {
        try stdout.print("{{\\"durationMs\\":{d}}}\\n", .{duration_ms});
    }
}
`;
}

export async function createZigRunner({ root, tempDir, algorithmsDir, slug, zigCommand = "zig" }) {
  const sourcePath = path.join(tempDir, `${slug}-zig-runner.zig`);
  const executablePath = path.join(tempDir, `${slug}-zig-runner`);
  const snippetPath = path.join(algorithmsDir, slug, "zig.zig");
  await writeFile(sourcePath, runnerSource(snippetPath, slug));
  runCommand(zigCommand, ["build-exe", "-O", "ReleaseFast", sourcePath, "-femit-bin=" + executablePath], root);

  function run(datasetPath, mode) {
    return JSON.parse(runCommand(executablePath, [datasetPath, mode], root));
  }

  return {
    async runWithResult(datasetPath) {
      return run(datasetPath, "full");
    },
    async measure(datasetPath) {
      return run(datasetPath, "time");
    },
  };
}
