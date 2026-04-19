import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { benchmarkLanguages, benchmarkProfiles } from "./dataset.js";
import { writeRanking, loadExistingRanking, buildEnvironmentSnapshot, buildHarnessSnapshot } from "./output.js";
import { computeScoreSnapshots, sortRanking } from "./scoring.js";
import {
  automatedEntryHasCurrentData,
  hasThreeLanguageSupport,
  inferBenchmarkDecision,
  isPublishedBenchmarkEntry,
  loadAlgorithms,
  loadReferenceRanking,
  root,
  tryRunCommand,
} from "./catalog.js";

const PARTIAL_RESULTS_DIR = process.env.PARTIAL_RESULTS_DIR || path.join(root, "benchmark-results");
const toolchain = {
  python: "python3",
  rust: "rustc",
  c: "cc",
};

async function loadPartialResults() {
  try {
    const files = await readdir(PARTIAL_RESULTS_DIR);
    const partials = [];

    for (const file of files) {
      if (!file.startsWith("benchmark-") || !file.endsWith(".json")) {
        continue;
      }

      const payload = JSON.parse(await readFile(path.join(PARTIAL_RESULTS_DIR, file), "utf8"));
      partials.push(payload);
    }

    return partials;
  } catch {
    return [];
  }
}

function buildAutomatedEntryFromPartials(algorithm, partials, environmentFallback, harnessFallback) {
  const byLanguage = new Map(partials.map((partial) => [partial.language, partial]));

  for (const language of benchmarkLanguages) {
    if (!byLanguage.has(language)) {
      throw new Error(`Missing partial benchmark result for ${algorithm.slug}/${language}.`);
    }
  }

  const firstPartial = byLanguage.get(benchmarkLanguages[0]);
  const workloadProfiles = Object.fromEntries(
    benchmarkProfiles.map((profile) => [
      profile,
      Object.fromEntries(
        benchmarkLanguages.map((language) => [language, byLanguage.get(language).profileResults?.[profile] ?? {}]),
      ),
    ]),
  );

  return {
    name: algorithm.name,
    slug: algorithm.slug,
    mode: "automated",
    results: Object.fromEntries(
      benchmarkLanguages.map((language) => [language, byLanguage.get(language).profileResults?.["random-uniform"] ?? {}]),
    ),
    unit: "ms",
    status: "benchmarked",
    metadata: {
      source: "github-actions",
      benchmarkMode: "automated",
      algorithmHash: firstPartial.metadata?.algorithmHash ?? algorithm.algorithmHash,
      lastRunAt: firstPartial.metadata?.lastRunAt,
      lastRunMode: "small",
    },
    snapshot: {
      workloadProfiles,
      tiers: {},
      environment: firstPartial.environment ?? environmentFallback,
      harness: firstPartial.harness ?? harnessFallback,
      score: {},
    },
  };
}

async function main() {
  const storedRanking = await loadReferenceRanking(loadExistingRanking);
  const existingRanking = storedRanking.filter(isPublishedBenchmarkEntry);
  const existingBySlug = new Map(existingRanking.map((entry) => [entry.slug, entry]));
  const algorithms = await loadAlgorithms();
  const partials = await loadPartialResults();
  const partialsBySlug = new Map();
  const environmentFallback = buildEnvironmentSnapshot({ toolchain, tryRunCommand });
  const harnessFallback = buildHarnessSnapshot();

  for (const partial of partials) {
    const bucket = partialsBySlug.get(partial.slug) ?? [];
    bucket.push(partial);
    partialsBySlug.set(partial.slug, bucket);
  }

  const ranking = [];

  for (const algorithm of algorithms) {
    const automatedSupport = await hasThreeLanguageSupport(algorithm.slug);
    const benchmarkDecision = inferBenchmarkDecision(algorithm, automatedSupport);
    const existingEntry = existingBySlug.get(algorithm.slug);
    const slugPartials = partialsBySlug.get(algorithm.slug) ?? [];

    if (benchmarkDecision.mode === "none") {
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
          algorithmHash: algorithm.algorithmHash,
          lastRunAt: existingEntry?.metadata?.lastRunAt,
          lastRunMode: "small",
        },
      });
      continue;
    }

    if (slugPartials.length > 0) {
      ranking.push(buildAutomatedEntryFromPartials(algorithm, slugPartials, environmentFallback, harnessFallback));
      continue;
    }

    if (automatedEntryHasCurrentData(existingEntry, algorithm.algorithmHash)) {
      ranking.push(JSON.parse(JSON.stringify(existingEntry)));
      continue;
    }

    throw new Error(`Missing benchmark data for benchmarkable algorithm ${algorithm.slug}.`);
  }

  computeScoreSnapshots(ranking);
  sortRanking(ranking);
  await writeRanking(root, ranking);
  console.log(`[benchmark] merged ${partials.length} partial result file(s) into ${ranking.length} benchmark entries`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
