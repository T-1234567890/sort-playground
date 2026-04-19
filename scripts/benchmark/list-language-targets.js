import { languageOutputPath, loadExistingLanguageRanking } from "./output.js";
import {
  hasThreeLanguageSupport,
  inferBenchmarkDecision,
  loadAlgorithms,
  loadReferenceRanking,
  root,
} from "./catalog.js";
import { benchmarkProfiles, benchmarkSizes } from "./dataset.js";
import { createCommunityLanguageHash, listCommunityLanguageTargets } from "./community-languages.js";

const BENCHMARK_RUN_MODE = process.env.BENCHMARK_RUN_MODE === "full" ? "full" : "small";

function experimentalEntryHasCurrentData(entry, languageKey, languageHash) {
  const languageEntry = entry?.languages?.[languageKey];

  if (!languageEntry?.metadata?.lastRunAt || languageEntry?.metadata?.languageHash !== languageHash) {
    return false;
  }

  if (!benchmarkSizes.every((size) => typeof languageEntry?.results?.[size] === "number")) {
    return false;
  }

  return benchmarkProfiles.every((profile) =>
    benchmarkSizes.every((size) => typeof languageEntry?.workloadProfiles?.[profile]?.[size] === "number"),
  );
}

async function main() {
  const algorithms = await loadAlgorithms();
  const algorithmBySlug = new Map(algorithms.map((algorithm) => [algorithm.slug, algorithm]));
  const experimentalTargets = await listCommunityLanguageTargets();
  const existingRanking = await loadReferenceRanking(loadExistingLanguageRanking, languageOutputPath);
  const existingBySlug = new Map(existingRanking.map((entry) => [entry.slug, entry]));
  const selected = [];

  for (const target of experimentalTargets) {
    if (!target.benchmarkSupported) {
      continue;
    }

    const algorithm = algorithmBySlug.get(target.slug);

    if (!algorithm) {
      continue;
    }

    const automatedSupport = await hasThreeLanguageSupport(algorithm.slug);
    const benchmarkDecision = inferBenchmarkDecision(algorithm, automatedSupport);

    if (benchmarkDecision.mode !== "automated") {
      continue;
    }

    const languageHash = await createCommunityLanguageHash(target.slug, target.file);

    if (BENCHMARK_RUN_MODE === "small") {
      const existingEntry = existingBySlug.get(target.slug);

      if (experimentalEntryHasCurrentData(existingEntry, target.languageKey, languageHash)) {
        continue;
      }
    }

    selected.push({ ...target, languageHash });
  }

  process.stdout.write(`${JSON.stringify(selected)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
