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

function slugToFunctionName(slug) {
  return slug.replace(/-/g, "_");
}

function pythonRunnerSource() {
  return `
import importlib.util
import json
import sys
import time

algorithm_path = sys.argv[1]
function_name = sys.argv[2]
dataset_path = sys.argv[3]
mode = sys.argv[4]

spec = importlib.util.spec_from_file_location("algorithm_module", algorithm_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
sort_function = getattr(module, function_name)

def load_values(path):
    with open(path, "r", encoding="utf-8") as handle:
        return [int(line.strip()) for line in handle if line.strip()]

def is_sorted(values):
    return all(values[index - 1] <= values[index] for index in range(1, len(values)))

values = load_values(dataset_path)
started = time.perf_counter()
result = sort_function(list(values))
finished = time.perf_counter()

if result is None or not is_sorted(result):
    raise RuntimeError("Python benchmark result was not sorted.")

payload = {"durationMs": round((finished - started) * 1000.0, 6)}
if mode == "full":
    payload["result"] = result

print(json.dumps(payload))
`;
}

export async function createPythonRunner({ root, tempDir, algorithmsDir, slug, pythonCommand = "python3" }) {
  const runnerPath = path.join(tempDir, `${slug}-python-runner.py`);
  const snippetPath = path.join(algorithmsDir, slug, "python.py");
  await writeFile(runnerPath, pythonRunnerSource());

  function run(datasetPath, mode) {
    return JSON.parse(runCommand(pythonCommand, [runnerPath, snippetPath, slugToFunctionName(slug), datasetPath, mode], root));
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
