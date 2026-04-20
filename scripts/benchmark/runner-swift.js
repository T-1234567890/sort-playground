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

function runnerSource(functionName) {
  return `
import Foundation

func loadValues(_ datasetPath: String) throws -> [Int] {
    let contents = try String(contentsOfFile: datasetPath, encoding: .utf8)
    return contents
        .split(whereSeparator: \\ .isNewline)
        .compactMap { Int($0) }
}

func isSorted(_ values: [Int]) -> Bool {
    guard values.count > 1 else { return true }
    for index in 1..<values.count {
        if values[index - 1] > values[index] {
            return false
        }
    }
    return true
}

let datasetPath = CommandLine.arguments[1]
let mode = CommandLine.arguments[2]
let values = try loadValues(datasetPath)

let started = DispatchTime.now().uptimeNanoseconds
let result = ${functionName}(values)
let finished = DispatchTime.now().uptimeNanoseconds

if !isSorted(result) {
    throw NSError(domain: "Benchmark", code: 1, userInfo: [NSLocalizedDescriptionKey: "Swift benchmark result was not sorted."])
}

let durationMs = Double(finished - started) / 1_000_000.0
if mode == "full" {
    let encoded = result.map(String.init).joined(separator: ",")
    print("{\\"durationMs\\":\\(durationMs),\\"result\\":[\\(encoded)]}")
} else {
    print("{\\"durationMs\\":\\(durationMs)}")
}
`;
}

export async function createSwiftRunner({ root, tempDir, algorithmsDir, slug, swiftCommand = "swiftc" }) {
  const snippetPath = path.join(algorithmsDir, slug, "swift.swift");
  const sourcePath = path.join(tempDir, `${slug}-swift-runner.swift`);
  const executablePath = path.join(tempDir, `${slug}-swift-runner`);
  const functionName = slugToCamelCase(slug);

  await writeFile(sourcePath, `${await (await import("node:fs/promises")).readFile(snippetPath, "utf8")}\n\n${runnerSource(functionName)}`);
  runCommand(swiftCommand, ["-O", sourcePath, "-o", executablePath], root);

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
