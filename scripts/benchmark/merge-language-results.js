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
import {
  createCommunityLanguageHash,
  experimentalBenchmarkSizesForLanguageCode,
  listCommunityLanguageTargets,
  listSupportedCommunityLanguages,
} from "./community-languages.js";

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

function experimentalEntryHasCurrentData(entry, languageKey, languageHash) {
  const languageEntry = entry?.languages?.[languageKey];
  const expectedSizes = experimentalBenchmarkSizesForLanguageCode(languageKey);

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
      (experimentalBenchmarkSizesForLanguageCode(partial.languageCode).includes("large")
        ? undefined
        : "Large dataset canceled for this language due to runtime constraints."),
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

const benchmarkReferenceTimesMs = {
  small: 0.1,
  medium: 1,
  large: 5,
};

const benchmarkSizes = ["small", "medium", "large"];

function average(values) {
  if (!values.length) {
    return undefined;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function fixedReferenceScore(reference, measuredValue) {
  if (typeof reference !== "number" || typeof measuredValue !== "number" || measuredValue <= 0 || !Number.isFinite(measuredValue)) {
    return undefined;
  }

  return (reference / measuredValue) * 100;
}

function isLanguageSizeCanceled(languageKey, language, size) {
  if (!language.experimental && languageKey === "python" && size === "large") {
    return true;
  }

  return Boolean(language.experimental && size === "large" && !experimentalBenchmarkSizesForLanguageCode(languageKey).includes("large"));
}

function experimentalSizeScore(languageKey, language, size) {
  if (language.status !== "benchmarked" || isLanguageSizeCanceled(languageKey, language, size)) {
    return undefined;
  }

  return fixedReferenceScore(benchmarkReferenceTimesMs[size], language.results?.[size]);
}

function experimentalDimensionScore(languageKey, language, profile) {
  if (language.status !== "benchmarked") {
    return undefined;
  }

  const values = benchmarkSizes
    .filter((size) => !isLanguageSizeCanceled(languageKey, language, size))
    .map((size) => {
      const profileValue = language.workloadProfiles?.[profile]?.[size];

      if (typeof profileValue === "number") {
        return { size, value: profileValue };
      }

      if (profile === "random-uniform") {
        const resultValue = language.results?.[size];
        return typeof resultValue === "number" ? { size, value: resultValue } : undefined;
      }

      return undefined;
    })
    .filter((item) => Boolean(item));

  if (!values.length) {
    return undefined;
  }

  return fixedReferenceScore(
    average(values.map((item) => benchmarkReferenceTimesMs[item.size])),
    average(values.map((item) => item.value)),
  );
}

function experimentalOverviewScores(languages) {
  const normalized = average(
    Object.entries(languages).flatMap(([languageKey, language]) =>
      benchmarkSizes.map((size) => experimentalSizeScore(languageKey, language, size)).filter((value) => typeof value === "number"),
    ),
  );
  const composite = average(
    Object.entries(languages).flatMap(([languageKey, language]) =>
      benchmarkProfiles.map((profile) => experimentalDimensionScore(languageKey, language, profile)).filter((value) => typeof value === "number"),
    ),
  );

  return { normalized, composite };
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

    const scoreSnapshot = experimentalOverviewScores(languages);

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
        mainBenchmarkCompositeScore: mainEntry.snapshot?.score?.composite,
        experimentalCompositeScore: scoreSnapshot.composite,
        experimentalNormalizedScore: scoreSnapshot.normalized,
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
