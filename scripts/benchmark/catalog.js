import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { benchmarkLanguages, benchmarkProfiles, benchmarkSizes } from "./dataset.js";

export const root = process.cwd();
export const algorithmsDir = path.join(root, "src/algorithms");

export function runCommand(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
}

export function tryRunCommand(command, args, options = {}) {
  try {
    return runCommand(command, args, options);
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

export function hasTool(command) {
  const result = spawnSync(command, ["--version"], { stdio: "ignore" });
  return result.status === 0;
}

export async function readOptional(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
}

export async function createAlgorithmHash(slug) {
  const hash = createHash("sha256");

  for (const file of ["meta.json", "python.py", "rust.rs", "c.c"]) {
    const content = await readOptional(path.join(algorithmsDir, slug, file));
    hash.update(`FILE:${file}\n`);
    hash.update(content ?? "__missing__");
    hash.update("\n");
  }

  return hash.digest("hex");
}

export async function hasThreeLanguageSupport(slug) {
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

export async function loadAlgorithms() {
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

export function inferBenchmarkDecision(algorithm, hasAutomatedSupport) {
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

  if (hasAutomatedSupport) {
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

export function isPublishedBenchmarkEntry(entry) {
  return entry?.mode === "automated" || entry?.mode === "estimated";
}

function requiredSizesForLanguage(language) {
  if (language === "python") {
    return benchmarkSizes.filter((size) => size !== "large");
  }

  return benchmarkSizes;
}

function hasRequiredSizeMetrics(bucket, language) {
  return requiredSizesForLanguage(language).every((size) => typeof bucket?.[size] === "number");
}

export function automatedEntryHasCurrentData(entry, expectedAlgorithmHash) {
  if (entry?.mode !== "automated") {
    return false;
  }

  if (!entry?.metadata?.lastRunAt || !entry?.metadata?.algorithmHash) {
    return false;
  }

  if (expectedAlgorithmHash && entry.metadata.algorithmHash !== expectedAlgorithmHash) {
    return false;
  }

  if (!benchmarkLanguages.every((language) => hasRequiredSizeMetrics(entry?.results?.[language], language))) {
    return false;
  }

  return benchmarkProfiles.every((profile) =>
    benchmarkLanguages.every((language) => hasRequiredSizeMetrics(entry?.snapshot?.workloadProfiles?.[profile]?.[language], language)),
  );
}

export async function loadReferenceRanking(loadExistingRanking, fallbackPath = "public/data/benchmark-ranking.json") {
  const localRanking = await loadExistingRanking(root);

  if (localRanking.length > 0) {
    return localRanking;
  }

  const fromOriginMain = tryRunCommand("git", ["show", `origin/main:${fallbackPath}`]);
  return parseRankingJson(fromOriginMain);
}
