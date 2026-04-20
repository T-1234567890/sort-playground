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

function slugToSnakeCase(slug) {
  return slug.replace(/-/g, "_");
}

function runnerSource(snippetPath, slug) {
  const functionName = slugToSnakeCase(slug);

  return `
require "json"

load ${JSON.stringify(snippetPath)}

dataset_path = ARGV[0]
mode = ARGV[1]

values = File.readlines(dataset_path, chomp: true).reject(&:empty?).map(&:to_i)
started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
result = send(${JSON.stringify(functionName)}, values.dup)
finished = Process.clock_gettime(Process::CLOCK_MONOTONIC)

unless result.is_a?(Array) && result.each_cons(2).all? { |left, right| left <= right }
  raise "Ruby benchmark result was not sorted."
end

payload = { durationMs: ((finished - started) * 1000.0).round(6) }
payload[:result] = result if mode == "full"
puts JSON.generate(payload)
`;
}

export async function createRubyRunner({ root, tempDir, algorithmsDir, slug, rubyCommand = "ruby" }) {
  const runnerPath = path.join(tempDir, `${slug}-ruby-runner.rb`);
  const snippetPath = path.join(algorithmsDir, slug, "rb.rb");
  await writeFile(runnerPath, runnerSource(snippetPath, slug));

  function run(datasetPath, mode) {
    return JSON.parse(runCommand(rubyCommand, [runnerPath, datasetPath, mode], root));
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
