import { readFile, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { datasetProfileLabel, benchmarkProfileWeights } from "./dataset.js";
import { MEASURED_RUNS, WARMUP_RUNS } from "./benchmark.js";

export const BENCHMARK_SPEC_VERSION = "draft-v2";
export const outputPath = "public/data/benchmark-ranking.json";
export const languageOutputPath = "public/data/benchmark-languages.json";

export async function loadExistingRanking(root) {
  try {
    return JSON.parse(await readFile(path.join(root, outputPath), "utf8"));
  } catch {
    return [];
  }
}

export async function writeRanking(root, ranking) {
  await mkdir(path.join(root, "public/data"), { recursive: true });
  await writeFile(path.join(root, outputPath), `${JSON.stringify(ranking, null, 2)}\n`);
}

export async function loadExistingLanguageRanking(root) {
  try {
    return JSON.parse(await readFile(path.join(root, languageOutputPath), "utf8"));
  } catch {
    return [];
  }
}

export async function writeLanguageRanking(root, ranking) {
  await mkdir(path.join(root, "public/data"), { recursive: true });
  await writeFile(path.join(root, languageOutputPath), `${JSON.stringify(ranking, null, 2)}\n`);
}

export function buildEnvironmentSnapshot({ toolchain, tryRunCommand }) {
  const pythonVersion = tryRunCommand(toolchain.python, ["--version"]);
  const rustVersion = tryRunCommand(toolchain.rust, ["--version"]);
  const compilerVersion = tryRunCommand(toolchain.c, ["--version"])?.split("\n")[0];
  const cpu = os.cpus()[0]?.model;

  return {
    benchmarkSpecVersion: BENCHMARK_SPEC_VERSION,
    runnerOs: process.env.RUNNER_OS ?? os.platform(),
    cpu,
    nodeVersion: process.version,
    pythonVersion,
    rustVersion,
    compilerVersion,
    workflowRunId: process.env.GITHUB_RUN_ID,
  };
}

export function buildHarnessSnapshot() {
  return {
    datasetGenerator: "deterministic-seeded",
    datasetProfile: datasetProfileLabel(),
    languageSizeExclusions: {
      python: {
        large: "Canceled due to Python runtime and technical constraints.",
      },
    },
    warmupPolicy: `${WARMUP_RUNS} warm-up runs`,
    runCountPolicy: `${MEASURED_RUNS} measured runs`,
    timeoutPolicy: "CI-managed",
    memoryConstraints: "runner-default",
    correctnessValidation: "sorted-output and cross-language identity",
    languageRunnerContract: "python.py, rust.rs, c.c",
    dimensionWeights: benchmarkProfileWeights,
  };
}
