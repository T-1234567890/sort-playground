import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
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
  const fileUrl = pathToFileURL(snippetPath).href;
  const functionName = slugToCamelCase(slug);

  return `
import fs from "node:fs";
import { performance } from "node:perf_hooks";

const datasetPath = process.argv[2];
const mode = process.argv[3];
const module = await import(${JSON.stringify(fileUrl)});
const sortFunction = module.default ?? module[${JSON.stringify(functionName)}];

if (typeof sortFunction !== "function") {
  throw new Error("JavaScript benchmark function was not found.");
}

const values = fs.readFileSync(datasetPath, "utf8")
  .split(/\\r?\\n/)
  .filter(Boolean)
  .map((value) => Number.parseInt(value, 10));

const started = performance.now();
const result = sortFunction([...values]);
const finished = performance.now();

if (!Array.isArray(result) || !result.every((value, index) => index === 0 || result[index - 1] <= value)) {
  throw new Error("JavaScript benchmark result was not sorted.");
}

const payload = { durationMs: Number((finished - started).toFixed(6)) };
if (mode === "full") {
  payload.result = result;
}

console.log(JSON.stringify(payload));
`;
}

export async function createJavaScriptRunner({ root, tempDir, algorithmsDir, slug, nodeCommand = "node" }) {
  const snippetPath = path.join(algorithmsDir, slug, "js.js");
  const runnerPath = path.join(tempDir, `${slug}-javascript-runner.mjs`);
  await writeFile(runnerPath, runnerSource(snippetPath, slug));

  function run(datasetPath, mode) {
    return JSON.parse(runCommand(nodeCommand, [runnerPath, datasetPath, mode], root));
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
