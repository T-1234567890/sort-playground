import { loadExistingRanking } from "./output.js";
import {
  automatedEntryHasCurrentData,
  hasThreeLanguageSupport,
  inferBenchmarkDecision,
  isPublishedBenchmarkEntry,
  loadAlgorithms,
  loadReferenceRanking,
  root,
} from "./catalog.js";

const BENCHMARK_RUN_MODE = process.env.BENCHMARK_RUN_MODE === "full" ? "full" : "small";

async function main() {
  const storedRanking = await loadReferenceRanking(loadExistingRanking);
  const existingBySlug = new Map(storedRanking.filter(isPublishedBenchmarkEntry).map((entry) => [entry.slug, entry]));
  const algorithms = await loadAlgorithms();
  const selected = [];

  for (const algorithm of algorithms) {
    const automatedSupport = await hasThreeLanguageSupport(algorithm.slug);
    const benchmarkDecision = inferBenchmarkDecision(algorithm, automatedSupport);

    if (benchmarkDecision.mode !== "automated") {
      continue;
    }

    if (BENCHMARK_RUN_MODE === "small") {
      const existingEntry = existingBySlug.get(algorithm.slug);
      if (automatedEntryHasCurrentData(existingEntry)) {
        continue;
      }
    }

    selected.push({ slug: algorithm.slug });
  }

  process.stdout.write(`${JSON.stringify(selected)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
