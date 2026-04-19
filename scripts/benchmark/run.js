import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { benchmarkIterations } from "./benchmark.js";
import { benchmarkLanguages, benchmarkProfiles, benchmarkSizes, createDatasets, writeDatasets } from "./dataset.js";
import { writeRanking, loadExistingRanking, buildEnvironmentSnapshot, buildHarnessSnapshot } from "./output.js";
import { createPythonRunner } from "./runner-python.js";
import { createRustRunner } from "./runner-rust.js";
import { createCRunner } from "./runner-c.js";
import { computeScoreSnapshots, sortRanking } from "./scoring.js";
import { assertIdenticalResults, assertSorted } from "./validator.js";

const root = process.cwd();
const algorithmsDir = path.join(root, "src/algorithms");
const toolchain = {
  python: "python3",
  rust: "rustc",
  c: "cc",
};
const BENCHMARK_RUN_MODE = "small";

function isPublishedBenchmarkEntry(entry) {
  return entry?.mode === "automated" || entry?.mode === "estimated";
}

function logBenchmark(message) {
  console.log(`[benchmark] ${message}`);
}

function runCommand(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
}

function tryRunCommand(command, args) {
  try {
    return runCommand(command, args);
  } catch {
    return undefined;
  }
}

function parseRankingJson(raw) {
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
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

async function loadReferenceRanking(root) {
  const localRanking = await loadExistingRanking(root);

  if (localRanking.length > 0) {
    return localRanking;
  }

  const fromOriginMain = tryRunCommand("git", ["show", `origin/main:public/data/benchmark-ranking.json`]);
  return parseRankingJson(fromOriginMain);
}

async function readOptional(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
}

async function createAlgorithmHash(slug) {
  const hash = createHash("sha256");

  for (const file of ["meta.json", "python.py", "rust.rs", "c.c"]) {
    const content = await readOptional(path.join(algorithmsDir, slug, file));
    hash.update(`FILE:${file}\n`);
    hash.update(content ?? "__missing__");
    hash.update("\n");
  }

  return hash.digest("hex");
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
    const algorithmHash = await createAlgorithmHash(slug);
    algorithms.push({ slug, algorithmHash, ...meta });
  }

  return algorithms.sort((left, right) => left.name.localeCompare(right.name));
}

function automatedEntryHasCurrentData(entry) {
  return Boolean(
    entry?.results &&
      entry?.snapshot?.workloadProfiles &&
      entry?.snapshot?.score?.dimensionScores &&
      typeof entry?.snapshot?.score?.composite === "number" &&
      entry?.metadata?.algorithmHash &&
      entry?.metadata?.lastRunAt,
  );
}

function shouldReuseCachedEntry(existingEntry, benchmarkDecision) {
  if (!existingEntry || existingEntry.mode !== benchmarkDecision.mode) {
    return false;
  }

  if (benchmarkDecision.mode === "automated") {
    return automatedEntryHasCurrentData(existingEntry);
  }

  return Boolean(existingEntry.metadata?.lastRunAt);
}

function createCachedEntry(existingEntry) {
  return JSON.parse(JSON.stringify(existingEntry));
}

async function benchmarkAutomatedAlgorithm(algorithm, datasetPaths, tempDir) {
  logBenchmark(`starting automated benchmark for ${algorithm.name} (${algorithm.slug})`);

  const runners = {
    python: await createPythonRunner({ root, tempDir, algorithmsDir, slug: algorithm.slug, pythonCommand: toolchain.python }),
    rust: await createRustRunner({ root, tempDir, algorithmsDir, slug: algorithm.slug, rustCommand: toolchain.rust }),
    c: await createCRunner({ root, tempDir, algorithmsDir, slug: algorithm.slug, cCommand: toolchain.c }),
  };
  const workloadProfiles = {};

  for (const profile of benchmarkProfiles) {
    workloadProfiles[profile] = {};

    for (const size of benchmarkSizes) {
      const datasetPath = datasetPaths[profile][size];
      const languageResults = {};
      logBenchmark(`${algorithm.slug}: validating ${profile}/${size}`);

      for (const language of benchmarkLanguages) {
        const validatedRun = await runners[language].runWithResult(datasetPath);
        assertSorted(validatedRun.result, `${algorithm.slug}/${profile}/${size}/${language}`);
        languageResults[language] = validatedRun.result;
      }

      assertIdenticalResults(languageResults, `${algorithm.slug}/${profile}/${size}`);

      for (const language of benchmarkLanguages) {
        const benchmarked = await benchmarkIterations({
          runner: runners[language],
          datasetPath,
          label: `${algorithm.slug} ${profile}/${size}/${language}`,
        });

        if (!workloadProfiles[profile][language]) {
          workloadProfiles[profile][language] = {};
        }

        workloadProfiles[profile][language][size] = benchmarked.averageMs;
      }
    }
  }

  return {
    results: workloadProfiles["random-uniform"],
    workloadProfiles,
    tiers: {},
  };
}

async function main() {
  assertGitHubActions();

  for (const [language, command] of Object.entries(toolchain)) {
    if (!hasTool(command)) {
      throw new Error(`Missing required ${language} toolchain: ${command}`);
    }
  }

  const storedRanking = await loadReferenceRanking(root);
  const existingRanking = storedRanking.filter(isPublishedBenchmarkEntry);
  const existingBySlug = new Map(existingRanking.map((entry) => [entry.slug, entry]));
  const algorithms = await loadAlgorithms();
  const lastRunAt = new Date().toISOString();
  logBenchmark(`mode=${BENCHMARK_RUN_MODE}`);
  logBenchmark(`loaded ${algorithms.length} algorithms and ${existingRanking.length} cached benchmark entries`);
  logBenchmark("small run will reuse existing benchmark entries and only test missing benchmarkable algorithms");

  const plans = [];

  for (const algorithm of algorithms) {
    const automatedSupport = await hasThreeLanguageSupport(algorithm.slug);
    const benchmarkDecision = inferBenchmarkDecision(algorithm, automatedSupport);
    const existingEntry = existingBySlug.get(algorithm.slug);

    if (benchmarkDecision.mode === "none") {
      plans.push({ algorithm, benchmarkDecision, existingEntry, action: "skip" });
      continue;
    }

    if (shouldReuseCachedEntry(existingEntry, benchmarkDecision)) {
      plans.push({ algorithm, benchmarkDecision, existingEntry, action: "reuse" });
      continue;
    }

    if (benchmarkDecision.mode === "estimated") {
      plans.push({ algorithm, benchmarkDecision, existingEntry, action: "estimate" });
      continue;
    }

    plans.push({ algorithm, benchmarkDecision, existingEntry, action: "benchmark" });
  }

  const benchmarkTargets = plans.filter((plan) => plan.action === "benchmark").map((plan) => plan.algorithm.slug);
  const estimatedTargets = plans.filter((plan) => plan.action === "estimate").map((plan) => plan.algorithm.slug);
  const reusedCount = plans.filter((plan) => plan.action === "reuse").length;
  const skippedCount = plans.filter((plan) => plan.action === "skip").length;

  logBenchmark(
    `small-plan: ${benchmarkTargets.length} automated benchmark(s), ${estimatedTargets.length} estimated entry refresh(es), ${reusedCount} reused entry(ies), ${skippedCount} excluded entry(ies)`,
  );

  if (benchmarkTargets.length === 0 && estimatedTargets.length === 0 && storedRanking.length === existingRanking.length) {
    logBenchmark("no missing benchmark entries detected; reusing existing benchmark data");
    return;
  }

  if (benchmarkTargets.length > 0) {
    logBenchmark(`small automated targets: ${benchmarkTargets.join(", ")}`);
  }
  if (estimatedTargets.length > 0) {
    logBenchmark(`small estimated targets: ${estimatedTargets.join(", ")}`);
  }

  const ranking = [];
  const environmentSnapshot = buildEnvironmentSnapshot({ toolchain, tryRunCommand });
  const harnessSnapshot = buildHarnessSnapshot();
  let tempDir;
  let datasetPaths;

  try {
    if (benchmarkTargets.length > 0) {
      tempDir = await mkdtemp(path.join(os.tmpdir(), "sort-playground-bench-"));
      const datasets = createDatasets();
      datasetPaths = await writeDatasets(tempDir, datasets);
      logBenchmark("wrote deterministic datasets to temporary workspace");
    }

    for (const plan of plans) {
      const { algorithm, benchmarkDecision, existingEntry, action } = plan;

      if (action === "skip") {
        logBenchmark(`${algorithm.slug}: excluded from benchmark (${benchmarkDecision.reason})`);
        continue;
      }

      if (action === "reuse") {
        logBenchmark(`${algorithm.slug}: reusing cached benchmark entry`);
        ranking.push(createCachedEntry(existingEntry));
        continue;
      }

      if (action === "estimate") {
        logBenchmark(`${algorithm.slug}: keeping estimated benchmark entry`);
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
            algorithmHash: algorithm.algorithmHash,
            lastRunAt,
            lastRunMode: BENCHMARK_RUN_MODE,
          },
        });
        continue;
      }

      const benchmarked = await benchmarkAutomatedAlgorithm(algorithm, datasetPaths, tempDir);
      logBenchmark(`${algorithm.slug}: automated benchmark complete`);

      ranking.push({
        name: algorithm.name,
        slug: algorithm.slug,
        mode: "automated",
        results: benchmarked.results,
        unit: "ms",
        status: "benchmarked",
        metadata: {
          source: "github-actions",
          benchmarkMode: "automated",
          algorithmHash: algorithm.algorithmHash,
          lastRunAt,
          lastRunMode: BENCHMARK_RUN_MODE,
        },
        snapshot: {
          workloadProfiles: benchmarked.workloadProfiles,
          tiers: benchmarked.tiers,
          environment: environmentSnapshot,
          harness: harnessSnapshot,
          score: {},
        },
      });
    }

    computeScoreSnapshots(ranking);
    sortRanking(ranking);
    await writeRanking(root, ranking);
    logBenchmark(`wrote ${ranking.length} benchmark entries in ${BENCHMARK_RUN_MODE} mode`);
  } finally {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
      logBenchmark("cleaned up temporary benchmark workspace");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
