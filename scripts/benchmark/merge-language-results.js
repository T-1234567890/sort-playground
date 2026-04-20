import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { benchmarkProfiles } from "./dataset.js";
import { languageOutputPath, loadExistingLanguageRanking, writeLanguageRanking } from "./output.js";
import {
  hasThreeLanguageSupport,
  inferBenchmarkDecision,
  loadAlgorithms,
  loadReferenceRanking,
  root,
} from "./catalog.js";
import { createCommunityLanguageHash, listCommunityLanguageTargets, listSupportedCommunityLanguages } from "./community-languages.js";

const PARTIAL_RESULTS_DIR = process.env.PARTIAL_RESULTS_DIR || path.join(root, "benchmark-language-results");
const MAIN_BENCHMARK_PATH = process.env.MAIN_BENCHMARK_PATH ? path.resolve(root, process.env.MAIN_BENCHMARK_PATH) : path.join(root, "public/data/benchmark-ranking.json");

async function loadJsonFile(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return [];
  }
}

async function loadPartialResults() {
  try {
    const files = await readdir(PARTIAL_RESULTS_DIR);
    const partials = [];

    for (const file of files) {
      if (!file.startsWith("community-language-") || !file.endsWith(".json")) {
        continue;
      }

      partials.push(JSON.parse(await readFile(path.join(PARTIAL_RESULTS_DIR, file), "utf8")));
    }

    return partials;
  } catch {
    return [];
  }
}

function getExperimentalBenchmarkSizes(languageKey) {
  return ["go", "java", "cpp", "swift", "zig"].includes(languageKey) ? ["small", "medium", "large"] : ["small", "medium"];
}

function experimentalEntryHasCurrentData(entry, languageKey, languageHash) {
  const languageEntry = entry?.languages?.[languageKey];
  const expectedSizes = getExperimentalBenchmarkSizes(languageKey);

  if (!languageEntry?.metadata?.lastRunAt || languageEntry?.metadata?.languageHash !== languageHash) {
    return false;
  }

  if (!expectedSizes.every((size) => typeof languageEntry?.results?.[size] === "number")) {
    return false;
  }

  return benchmarkProfiles.every((profile) =>
    expectedSizes.every((size) => typeof languageEntry?.workloadProfiles?.[profile]?.[size] === "number"),
  );
}

function buildMainLanguageEntry(entry, languageKey, label) {
  return {
    label,
    source: "main",
    experimental: false,
    communityProvided: false,
    status: "benchmarked",
    results: entry.results?.[languageKey] ?? {},
    workloadProfiles: Object.fromEntries(
      benchmarkProfiles.map((profile) => [profile, entry.snapshot?.workloadProfiles?.[profile]?.[languageKey] ?? {}]),
    ),
    metadata: {
      lastRunAt: entry.metadata?.lastRunAt,
      benchmarkMode: "main",
      algorithmHash: entry.metadata?.algorithmHash,
    },
  };
}

function buildExperimentalLanguageEntry(partial) {
  return {
    label: partial.label,
    source: partial.source,
    experimental: true,
    communityProvided: true,
    status: "benchmarked",
    file: partial.file,
    runtime: partial.runtime,
    note:
      partial.harness?.languageSizeExclusions?.[partial.languageCode]?.large ??
      (getExperimentalBenchmarkSizes(partial.languageCode).includes("large") ? undefined : "Large dataset canceled for this language due to runtime constraints."),
    results: partial.profileResults?.["random-uniform"] ?? {},
    workloadProfiles: partial.profileResults ?? {},
    metadata: {
      lastRunAt: partial.metadata?.lastRunAt,
      languageHash: partial.metadata?.languageHash,
      benchmarkMode: partial.metadata?.benchmarkMode,
    },
  };
}

function buildUnsupportedExperimentalLanguageEntry(target, existingLanguage) {
  return {
    label: target.label,
    source: target.source,
    experimental: true,
    communityProvided: true,
    status: "unsupported",
    note: target.note,
    file: target.file,
    runtime: target.runtime,
    results: existingLanguage?.results ?? {},
    workloadProfiles: existingLanguage?.workloadProfiles ?? {},
    metadata: {
      ...existingLanguage?.metadata,
      languageHash: existingLanguage?.metadata?.languageHash,
      benchmarkMode: "community-language",
    },
  };
}

function buildMissingExperimentalLanguageEntry(target, existingLanguage) {
  return {
    label: target.label,
    source: target.source,
    experimental: true,
    communityProvided: true,
    status: "missing",
    note: existingLanguage?.note ?? "No community implementation has been added for this language yet.",
    runtime: target.runtime,
    results: existingLanguage?.results ?? {},
    workloadProfiles: existingLanguage?.workloadProfiles ?? {},
    metadata: {
      ...existingLanguage?.metadata,
      benchmarkMode: "community-language",
    },
  };
}

function hasSuccessfulExperimentalLanguage(languages) {
  return Object.values(languages).some((language) => language.experimental && language.status === "benchmarked");
}

async function main() {
  const algorithms = await loadAlgorithms();
  const algorithmBySlug = new Map(algorithms.map((algorithm) => [algorithm.slug, algorithm]));
  const targets = await listCommunityLanguageTargets();
  const supportedCommunityLanguages = listSupportedCommunityLanguages();
  const targetsBySlugAndLanguage = new Map(targets.map((target) => [`${target.slug}:${target.languageKey}`, target]));
  const partials = await loadPartialResults();
  const partialsByKey = new Map(partials.map((partial) => [`${partial.slug}:${partial.languageKey}`, partial]));
  const mainRanking = await loadJsonFile(MAIN_BENCHMARK_PATH);
  const mainBySlug = new Map(mainRanking.map((entry) => [entry.slug, entry]));
  const existingExperimental = await loadReferenceRanking(loadExistingLanguageRanking, languageOutputPath);
  const existingBySlug = new Map(existingExperimental.map((entry) => [entry.slug, entry]));

  const ranking = [];

  for (const mainEntry of mainRanking) {
    const slug = mainEntry.slug;
    const algorithm = algorithmBySlug.get(slug);

    if (!algorithm || !mainEntry || mainEntry.mode !== "automated") {
      continue;
    }

    const automatedSupport = await hasThreeLanguageSupport(slug);
    const benchmarkDecision = inferBenchmarkDecision(algorithm, automatedSupport);

    if (benchmarkDecision.mode !== "automated") {
      continue;
    }

    const existingEntry = existingBySlug.get(slug);
    const languages = {
      python: buildMainLanguageEntry(mainEntry, "python", "Python"),
      rust: buildMainLanguageEntry(mainEntry, "rust", "Rust"),
      c: buildMainLanguageEntry(mainEntry, "c", "C"),
    };

    for (const supportedLanguage of supportedCommunityLanguages) {
      const target = targetsBySlugAndLanguage.get(`${slug}:${supportedLanguage.languageKey}`);
      const partial = partialsByKey.get(`${slug}:${supportedLanguage.languageKey}`);
      const existingLanguage = existingEntry?.languages?.[supportedLanguage.languageKey];

      if (!target) {
        languages[supportedLanguage.languageKey] = buildMissingExperimentalLanguageEntry(supportedLanguage, existingLanguage);
        continue;
      }

      if (!target.benchmarkSupported) {
        languages[target.languageKey] = buildUnsupportedExperimentalLanguageEntry(target, existingLanguage);
        continue;
      }

      const languageHash = await createCommunityLanguageHash(slug, target.file);

      if (partial) {
        languages[target.languageKey] = buildExperimentalLanguageEntry(partial);
        continue;
      }

      if (experimentalEntryHasCurrentData(existingEntry, target.languageKey, languageHash)) {
        languages[target.languageKey] = JSON.parse(JSON.stringify(existingEntry.languages[target.languageKey]));
        continue;
      }

      languages[target.languageKey] = buildUnsupportedExperimentalLanguageEntry(
        {
          ...target,
          note: "Community implementation exists, but benchmark results are not available yet.",
        },
        existingLanguage,
      );
    }

    if (!hasSuccessfulExperimentalLanguage(languages)) {
      continue;
    }

    ranking.push({
      name: mainEntry.name,
      slug: mainEntry.slug,
      unit: mainEntry.unit ?? "ms",
      status: "benchmarked",
      labels: {
        experimental: "Experimental",
        communityProvided: "Community provided",
      },
      languages,
      metadata: {
        lastUpdatedAt: new Date().toISOString(),
      },
    });
  }

  ranking.sort((left, right) => left.name.localeCompare(right.name));
  await writeLanguageRanking(root, ranking);
  console.log(`[benchmark:languages] merged ${partials.length} partial result file(s) into ${ranking.length} experimental language entries`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
