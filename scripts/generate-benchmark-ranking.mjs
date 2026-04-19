import { mkdtemp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { execFileSync, spawnSync } from "node:child_process";

const root = process.cwd();
const algorithmsDir = path.join(root, "src/algorithms");
const outputDir = path.join(root, "public/data");
const outputPath = path.join(outputDir, "benchmark-ranking.json");
const WARMUP_RUNS = 2;
const MAX_MEASURED_RUNS = 10;
const MIN_MEASURED_RUNS = 2;
const TARGET_MEASURED_WINDOW_MS = 100.0;
const TARGET_MEASURED_WINDOW_MS_LITERAL = TARGET_MEASURED_WINDOW_MS.toFixed(1);

const datasetSizes = {
  small: 100,
  medium: 1000,
  large: 10000,
};

const datasetSeeds = {
  small: 7,
  medium: 13,
  large: 29,
};
const MAX_DATASET_VALUE = 1024;

const toolchain = {
  python: "python3",
  rust: "rustc",
  c: "cc",
};
const BENCHMARK_SPEC_VERSION = "draft-v1";
const BENCHMARK_WORKLOAD_PROFILES = [
  "random-uniform",
  "nearly-sorted",
  "reverse-sorted",
  "many-duplicates",
  "low-value-range",
  "high-value-range",
  "adversarial-pivot",
  "stable-sensitive",
];
const BENCHMARK_TIERS = ["lite", "standard", "extreme"];

const rustCallConfig = {
  "merge-sort": { mode: "return-vec", type: "i32" },
  "bead-sort": { mode: "return-vec", type: "usize" },
};

const cCallConfig = {
  "quick-sort": { mode: "low-high", type: "int" },
  "merge-sort": { mode: "low-high", type: "int" },
  "bead-sort": { mode: "length", type: "unsigned int" },
};

function createDataset(size, seed) {
  let state = seed;

  return Array.from({ length: size }, () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return (state % MAX_DATASET_VALUE) + 1;
  });
}

function createDatasets() {
  return Object.fromEntries(
    Object.entries(datasetSizes).map(([label, size]) => [label, createDataset(size, datasetSeeds[label])]),
  );
}

function slugToFunctionName(slug) {
  return slug.replace(/-/g, "_");
}

function hasTool(command) {
  const result = spawnSync(command, ["--version"], { stdio: "ignore" });
  return result.status === 0;
}

function assertGitHubActions() {
  if (process.env.GITHUB_ACTIONS !== "true") {
    throw new Error("Benchmark data is CI-only. Run this script from GitHub Actions.");
  }
}

function inferBenchmarkDecision(algorithm, hasThreeLanguageSupport) {
  if (algorithm.benchmarkMode === "none" || algorithm.benchmark === false || algorithm.special === "no-benchmark") {
    return {
      mode: "none",
      reason: algorithm.special || "benchmark=false",
      source: "algorithm-meta",
    };
  }

  const keywords = (algorithm.keywords ?? []).map((keyword) => String(keyword).toLowerCase());
  const text = [algorithm.name, algorithm.description, algorithm.complexity, ...keywords]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const exponentMatch = text.match(/n\^([0-9]+(?:\.[0-9]+)?)/);
  const exponent = exponentMatch ? Number.parseFloat(exponentMatch[1]) : null;

  if (
    text.includes("random") ||
    text.includes("shuffle") ||
    text.includes("manual") ||
    text.includes("depends on you") ||
    text.includes("undefined") ||
    text.includes("impossible") ||
    text.includes("never") ||
    text.includes("exponential") ||
    (typeof exponent === "number" && exponent > 2.2)
  ) {
    return {
      mode: "none",
      reason: "auto-excluded-unusual",
      source: "auto-scan",
    };
  }

  if (hasThreeLanguageSupport) {
    return {
      mode: "automated",
      reason: "three-language-benchmark",
      source: "auto-scan",
    };
  }

  if (algorithm.benchmarkMode === "estimated") {
    return {
      mode: "estimated",
      reason: "estimated-fallback",
      source: "algorithm-meta",
    };
  }

  return {
    mode: "none",
    reason: "missing-three-language-support",
    source: "auto-scan",
  };
}

async function loadAlgorithms() {
  const entries = await readdir(algorithmsDir, { withFileTypes: true });
  const algorithms = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const slug = entry.name;
    const metaPath = path.join(algorithmsDir, slug, "meta.json");
    const meta = JSON.parse(await readFile(metaPath, "utf8"));
    algorithms.push({ slug, ...meta });
  }

  return algorithms.sort((a, b) => a.name.localeCompare(b.name));
}

async function writeDatasets(tempDir, datasets) {
  const paths = {};

  for (const [label, values] of Object.entries(datasets)) {
    const filePath = path.join(tempDir, `${label}.txt`);
    await writeFile(filePath, `${values.join("\n")}\n`);
    paths[label] = filePath;
  }

  return paths;
}

function pythonRunnerSource() {
  return `
import importlib.util
import json
import sys
import time

WARMUP_RUNS = ${WARMUP_RUNS}
MIN_MEASURED_RUNS = ${MIN_MEASURED_RUNS}
MAX_MEASURED_RUNS = ${MAX_MEASURED_RUNS}
TARGET_MEASURED_WINDOW_MS = ${TARGET_MEASURED_WINDOW_MS}

algorithm_path = sys.argv[1]
function_name = sys.argv[2]
dataset_paths = {"small": sys.argv[3], "medium": sys.argv[4], "large": sys.argv[5]}

spec = importlib.util.spec_from_file_location("algorithm_module", algorithm_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
sort_function = getattr(module, function_name)

def load_values(path):
    with open(path, "r", encoding="utf-8") as handle:
        return [int(line.strip()) for line in handle if line.strip()]

def is_sorted(values):
    return all(values[index - 1] <= values[index] for index in range(1, len(values)))

def run_once(values):
    result = sort_function(list(values))
    if result is None:
        raise RuntimeError("Python benchmark function must return the sorted list.")
    if not is_sorted(result):
        raise RuntimeError("Python benchmark result was not sorted.")

def measure_average(values):
    for _ in range(WARMUP_RUNS):
        run_once(values)

    probe_started = time.perf_counter()
    run_once(values)
    probe_finished = time.perf_counter()
    probe_ms = max((probe_finished - probe_started) * 1000.0, 0.001)
    measured_runs = max(MIN_MEASURED_RUNS, min(MAX_MEASURED_RUNS, int(TARGET_MEASURED_WINDOW_MS / probe_ms)))

    started = time.perf_counter()
    for _ in range(measured_runs):
        run_once(values)
    finished = time.perf_counter()
    return round(((finished - started) * 1000.0) / measured_runs, 3)

results = {}
for label, dataset_path in dataset_paths.items():
    results[label] = measure_average(load_values(dataset_path))

print(json.dumps(results))
`;
}

function rustRunnerSource(snippetPath, slug) {
  const functionName = slugToFunctionName(slug);
  const config = rustCallConfig[slug] ?? { mode: "mut-slice", type: "i32" };
  const parser = config.type === "usize" ? "value.parse::<usize>().unwrap()" : "value.parse::<i32>().unwrap()";
  const sortableCall = config.mode === "return-vec"
    ? `${functionName}(&values)`
    : `{ let mut copy = values.to_vec(); ${functionName}(&mut copy); copy }`;

  return `
use std::env;
use std::fs;
use std::time::Instant;

const WARMUP_RUNS: usize = ${WARMUP_RUNS};
const MIN_MEASURED_RUNS: usize = ${MIN_MEASURED_RUNS};
const MAX_MEASURED_RUNS: usize = ${MAX_MEASURED_RUNS};
const TARGET_MEASURED_WINDOW_MS: f64 = ${TARGET_MEASURED_WINDOW_MS_LITERAL};

include!(${JSON.stringify(snippetPath)});

fn load_values(path: &str) -> Vec<${config.type}> {
    fs::read_to_string(path)
        .unwrap()
        .lines()
        .filter(|line| !line.trim().is_empty())
        .map(|value| ${parser})
        .collect()
}

fn is_sorted(values: &[${config.type}]) -> bool {
    values.windows(2).all(|window| window[0] <= window[1])
}

fn run_once(values: &[${config.type}]) {
    let result = ${sortableCall};
    if !is_sorted(&result) {
        panic!("Rust benchmark result was not sorted.");
    }
}

fn measure_average(values: &[${config.type}]) -> f64 {
    for _ in 0..WARMUP_RUNS {
        run_once(values);
    }

    let probe_started = Instant::now();
    run_once(values);
    let probe_ms = (probe_started.elapsed().as_secs_f64() * 1000.0).max(0.001);
    let measured_runs = ((TARGET_MEASURED_WINDOW_MS / probe_ms) as usize)
        .clamp(MIN_MEASURED_RUNS, MAX_MEASURED_RUNS);

    let started = Instant::now();
    for _ in 0..measured_runs {
        run_once(values);
    }

    (started.elapsed().as_secs_f64() * 1000.0) / (measured_runs as f64)
}

fn main() {
    let args: Vec<String> = env::args().collect();
    let small = load_values(&args[1]);
    let medium = load_values(&args[2]);
    let large = load_values(&args[3]);
    let small_ms = measure_average(&small);
    let medium_ms = measure_average(&medium);
    let large_ms = measure_average(&large);

    println!(
        "{{\\"small\\":{:.3},\\"medium\\":{:.3},\\"large\\":{:.3}}}",
        small_ms,
        medium_ms,
        large_ms
    );
}
`;
}

function cRunnerSource(snippetPath, slug) {
  const functionName = slugToFunctionName(slug);
  const config = cCallConfig[slug] ?? { mode: "length", type: "int" };
  const scanFormat = config.type === "unsigned int" ? "%u" : "%d";
  const invoke = config.mode === "low-high"
    ? `if (length > 0) { ${functionName}(copy, 0, length - 1); }`
    : `${functionName}(copy, length);`;

  return `
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

${snippetPath.endsWith(".c") ? `#include ${JSON.stringify(snippetPath)}` : ""}

#define WARMUP_RUNS ${WARMUP_RUNS}
#define MIN_MEASURED_RUNS ${MIN_MEASURED_RUNS}
#define MAX_MEASURED_RUNS ${MAX_MEASURED_RUNS}
#define TARGET_MEASURED_WINDOW_MS ${TARGET_MEASURED_WINDOW_MS}

typedef ${config.type} value_t;

static value_t *load_values(const char *path, int *length) {
    FILE *file = fopen(path, "r");
    if (!file) {
        perror("fopen");
        exit(1);
    }

    int capacity = 128;
    int count = 0;
    value_t *values = malloc((size_t) capacity * sizeof(value_t));
    if (!values) {
        perror("malloc");
        exit(1);
    }

    value_t value;
    while (fscanf(file, "${scanFormat}", &value) == 1) {
        if (count == capacity) {
            capacity *= 2;
            values = realloc(values, (size_t) capacity * sizeof(value_t));
            if (!values) {
                perror("realloc");
                exit(1);
            }
        }
        values[count++] = value;
    }

    fclose(file);
    *length = count;
    return values;
}

static int is_sorted(const value_t values[], int length) {
    for (int index = 1; index < length; index++) {
        if (values[index - 1] > values[index]) {
            return 0;
        }
    }
    return 1;
}

static void run_once(const value_t values[], int length) {
    value_t *copy = malloc((size_t) length * sizeof(value_t));
    if (!copy) {
        perror("malloc");
        exit(1);
    }

    memcpy(copy, values, (size_t) length * sizeof(value_t));
    ${invoke}

    if (!is_sorted(copy, length)) {
        fprintf(stderr, "C benchmark result was not sorted.\\n");
        exit(1);
    }

    free(copy);
}

static double now_ms(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ((double) ts.tv_sec * 1000.0) + ((double) ts.tv_nsec / 1000000.0);
}

static double measure_average(const value_t values[], int length) {
    for (int warmup = 0; warmup < WARMUP_RUNS; warmup++) {
        run_once(values, length);
    }

    double probe_started = now_ms();
    run_once(values, length);
    double probe_ms = now_ms() - probe_started;
    if (probe_ms < 0.001) {
        probe_ms = 0.001;
    }
    int measured_runs = (int) (TARGET_MEASURED_WINDOW_MS / probe_ms);
    if (measured_runs < MIN_MEASURED_RUNS) {
        measured_runs = MIN_MEASURED_RUNS;
    }
    if (measured_runs > MAX_MEASURED_RUNS) {
        measured_runs = MAX_MEASURED_RUNS;
    }

    double started = now_ms();
    for (int run = 0; run < measured_runs; run++) {
        run_once(values, length);
    }
    double finished = now_ms();

    return (finished - started) / (double) measured_runs;
}

int main(int argc, char **argv) {
    if (argc != 4) {
        fprintf(stderr, "Expected 3 dataset paths.\\n");
        return 1;
    }

    int small_length = 0;
    int medium_length = 0;
    int large_length = 0;
    value_t *small = load_values(argv[1], &small_length);
    value_t *medium = load_values(argv[2], &medium_length);
    value_t *large = load_values(argv[3], &large_length);

    double small_ms = measure_average(small, small_length);
    double medium_ms = measure_average(medium, medium_length);
    double large_ms = measure_average(large, large_length);

    printf("{\\"small\\":%.3f,\\"medium\\":%.3f,\\"large\\":%.3f}\\n", small_ms, medium_ms, large_ms);

    free(small);
    free(medium);
    free(large);
    return 0;
}
`;
}

function runCommand(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
}

async function benchmarkPython(snippetPath, slug, datasetPaths, tempDir) {
  const runnerPath = path.join(tempDir, `${slug}-python-runner.py`);
  await writeFile(runnerPath, pythonRunnerSource());

  return JSON.parse(runCommand(toolchain.python, [
    runnerPath,
    snippetPath,
    slugToFunctionName(slug),
    datasetPaths.small,
    datasetPaths.medium,
    datasetPaths.large,
  ]));
}

async function benchmarkRust(snippetPath, slug, datasetPaths, tempDir) {
  const sourcePath = path.join(tempDir, `${slug}-rust-runner.rs`);
  const executablePath = path.join(tempDir, `${slug}-rust-runner`);
  await writeFile(sourcePath, rustRunnerSource(snippetPath, slug));
  runCommand(toolchain.rust, ["-O", sourcePath, "-o", executablePath]);

  return JSON.parse(runCommand(executablePath, [
    datasetPaths.small,
    datasetPaths.medium,
    datasetPaths.large,
  ]));
}

async function benchmarkC(snippetPath, slug, datasetPaths, tempDir) {
  const sourcePath = path.join(tempDir, `${slug}-c-runner.c`);
  const executablePath = path.join(tempDir, `${slug}-c-runner`);
  await writeFile(sourcePath, cRunnerSource(snippetPath, slug));
  runCommand(toolchain.c, ["-O2", sourcePath, "-o", executablePath]);

  return JSON.parse(runCommand(executablePath, [
    datasetPaths.small,
    datasetPaths.medium,
    datasetPaths.large,
  ]));
}

async function benchmarkAutomatedAlgorithm(algorithm, datasetPaths, tempDir) {
  const slug = algorithm.slug;

  const snippetPaths = {
    python: path.join(algorithmsDir, slug, "python.py"),
    rust: path.join(algorithmsDir, slug, "rust.rs"),
    c: path.join(algorithmsDir, slug, "c.c"),
  };

  return {
    python: await benchmarkPython(snippetPaths.python, slug, datasetPaths, tempDir),
    rust: await benchmarkRust(snippetPaths.rust, slug, datasetPaths, tempDir),
    c: await benchmarkC(snippetPaths.c, slug, datasetPaths, tempDir),
  };
}

async function hasThreeLanguageSupport(slug) {
  const requiredFiles = ["python.py", "rust.rs", "c.c"];

  for (const file of requiredFiles) {
    try {
      await readFile(path.join(algorithmsDir, slug, file), "utf8");
    } catch {
      return false;
    }
  }

  return true;
}

async function main() {
  assertGitHubActions();

  for (const [language, command] of Object.entries(toolchain)) {
    if (!hasTool(command)) {
      throw new Error(`Missing required ${language} toolchain: ${command}`);
    }
  }

  const datasets = createDatasets();
  const algorithms = await loadAlgorithms();
  const ranking = [];
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "sort-playground-bench-"));

  try {
    const datasetPaths = await writeDatasets(tempDir, datasets);

    for (const algorithm of algorithms) {
      const automatedSupport = await hasThreeLanguageSupport(algorithm.slug);
      const benchmarkDecision = inferBenchmarkDecision(algorithm, automatedSupport);

      if (benchmarkDecision.mode === "none") {
        ranking.push({
          name: algorithm.name,
          slug: algorithm.slug,
          mode: "none",
          status: "exempt",
          reason: benchmarkDecision.reason,
          metadata: {
            source: benchmarkDecision.source,
            benchmarkMode: "none",
          },
        });
        continue;
      }

      if (benchmarkDecision.mode === "estimated") {
        ranking.push({
          name: algorithm.name,
          slug: algorithm.slug,
          mode: "estimated",
          complexity: algorithm.complexity,
          relativeRank: algorithm.benchmarkRelativeRank || "medium",
          status: "estimated",
          metadata: {
            source: benchmarkDecision.source,
            benchmarkMode: "estimated",
          },
        });
        continue;
      }

      const results = await benchmarkAutomatedAlgorithm(algorithm, datasetPaths, tempDir);

      ranking.push({
        name: algorithm.name,
        slug: algorithm.slug,
        mode: "automated",
        results,
        unit: "ms",
        status: "benchmarked",
        metadata: {
          source: "github-actions",
          benchmarkMode: "automated",
        },
        snapshot: {
          workloadProfiles: Object.fromEntries(BENCHMARK_WORKLOAD_PROFILES.map((profile) => [profile, undefined])),
          tiers: Object.fromEntries(BENCHMARK_TIERS.map((tier) => [tier, undefined])),
          environment: {
            benchmarkSpecVersion: BENCHMARK_SPEC_VERSION,
            runnerOs: process.env.RUNNER_OS,
            workflowRunId: process.env.GITHUB_RUN_ID,
          },
          harness: {
            datasetGenerator: "deterministic-seeded",
            warmupPolicy: `${WARMUP_RUNS} warm-up runs`,
            runCountPolicy: `adaptive ${MIN_MEASURED_RUNS}-${MAX_MEASURED_RUNS} measured runs`,
            timeoutPolicy: "CI-managed",
            memoryConstraints: "runner-default",
            correctnessValidation: "sorted-output verification",
            languageRunnerContract: "python.py, rust.rs, c.c",
          },
          score: {},
        },
      });
    }

    ranking.sort((left, right) => {
      if (left.mode === "none" && right.mode !== "none") {
        return 1;
      }

      if (left.mode !== "none" && right.mode === "none") {
        return -1;
      }

      if (left.mode === "automated" && right.mode === "estimated") {
        return -1;
      }

      if (left.mode === "estimated" && right.mode === "automated") {
        return 1;
      }

      if (left.mode === "estimated" && right.mode === "estimated") {
        const rankOrder = { high: 0, medium: 1, low: 2 };
        return rankOrder[left.relativeRank || "medium"] - rankOrder[right.relativeRank || "medium"] || left.name.localeCompare(right.name);
      }

      return (
        (left.results?.python?.medium ?? Number.POSITIVE_INFINITY) -
          (right.results?.python?.medium ?? Number.POSITIVE_INFINITY) ||
        left.name.localeCompare(right.name)
      );
    });

    await mkdir(outputDir, { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(ranking, null, 2)}\n`);
    console.log(`Wrote ${ranking.length} benchmark entries.`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
