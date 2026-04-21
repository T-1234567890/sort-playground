import { benchmarkProfiles, benchmarkReferenceTimesMs, benchmarkSizes, isBenchmarkSizeCanceled, type BenchmarkScoreDisplayMode } from "./benchmark";
import type { BenchmarkSize, BenchmarkWorkloadProfile, ExperimentalBenchmarkLanguageEntry, ExperimentalLanguageBenchmarkEntry } from "./types";

const experimentalLargeEnabledLanguages = new Set(["go", "java", "cpp", "swift", "zig"]);

export function formatExperimentalMetric(value?: number, unit = "ms") {
  if (typeof value !== "number") {
    return "-";
  }

  return `${value.toFixed(3)} ${unit}`;
}

function average(values: number[]) {
  if (!values.length) {
    return undefined;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function fixedReferenceScore(reference: number | undefined, measuredValue?: number) {
  if (typeof reference !== "number" || typeof measuredValue !== "number" || measuredValue <= 0 || !Number.isFinite(measuredValue)) {
    return undefined;
  }

  return (reference / measuredValue) * 100;
}

function experimentalLanguageStatusAllowsScores(language?: ExperimentalBenchmarkLanguageEntry) {
  return language?.status === "benchmarked";
}

function isLanguageSizeCanceled(languageKey: string, language: ExperimentalBenchmarkLanguageEntry, size: BenchmarkSize) {
  if (!language.experimental && (languageKey === "python" || languageKey === "rust" || languageKey === "c")) {
    return isBenchmarkSizeCanceled(languageKey, size);
  }

  if (language.experimental) {
    return isExperimentalSizeCanceled(languageKey, size);
  }

  return false;
}

export function getDisplayedExperimentalScore(value?: number, mode: BenchmarkScoreDisplayMode = "processed") {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value) || value <= 0) {
    return undefined;
  }

  return mode === "raw" ? value / 100 : value;
}

export function formatExperimentalScore(value?: number, mode: BenchmarkScoreDisplayMode = "processed") {
  const displayed = getDisplayedExperimentalScore(value, mode);

  if (typeof displayed !== "number") {
    return "-";
  }

  return displayed.toFixed(1);
}

export function getExperimentalSizeScore(entry: ExperimentalLanguageBenchmarkEntry, languageKey: string, size: BenchmarkSize) {
  const language = entry.languages[languageKey];

  if (!experimentalLanguageStatusAllowsScores(language) || isLanguageSizeCanceled(languageKey, language, size)) {
    return undefined;
  }

  return fixedReferenceScore(benchmarkReferenceTimesMs[size], language.results?.[size]);
}

export function getExperimentalDimensionScore(entry: ExperimentalLanguageBenchmarkEntry, languageKey: string, profile: BenchmarkWorkloadProfile) {
  const language = entry.languages[languageKey];

  if (!experimentalLanguageStatusAllowsScores(language)) {
    return undefined;
  }

  const includedSizes = benchmarkSizes.filter((size) => !isLanguageSizeCanceled(languageKey, language, size));
  const values = includedSizes
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
    .filter((item): item is { size: BenchmarkSize; value: number } => Boolean(item));

  if (!values.length) {
    return undefined;
  }

  const profileAverage = average(values.map((item) => item.value));
  const referenceAverage = average(values.map((item) => benchmarkReferenceTimesMs[item.size]));
  return fixedReferenceScore(referenceAverage, profileAverage);
}

export function getExperimentalNormalizedScore(entry: ExperimentalLanguageBenchmarkEntry) {
  const sizeScores = Object.keys(entry.languages).flatMap((languageKey) =>
    benchmarkSizes
      .map((size) => getExperimentalSizeScore(entry, languageKey, size))
      .filter((value): value is number => typeof value === "number"),
  );

  return average(sizeScores);
}

export function getExperimentalCompositeScore(entry: ExperimentalLanguageBenchmarkEntry) {
  const dimensionScores = Object.keys(entry.languages).flatMap((languageKey) =>
    benchmarkProfiles
      .map((profile) => getExperimentalDimensionScore(entry, languageKey, profile))
      .filter((value): value is number => typeof value === "number"),
  );

  return average(dimensionScores);
}

export function formatExperimentalScoreWithFallback(
  entry: ExperimentalLanguageBenchmarkEntry,
  mode: BenchmarkScoreDisplayMode = "processed",
) {
  return formatExperimentalScore(getExperimentalOverviewScore(entry), mode);
}

export function getExperimentalOverviewScore(entry: ExperimentalLanguageBenchmarkEntry) {
  return entry.metadata?.experimentalCompositeScore ?? getExperimentalCompositeScore(entry) ?? entry.metadata?.mainBenchmarkCompositeScore;
}

export function getExperimentalReferenceBaseline(mode: BenchmarkScoreDisplayMode = "processed") {
  return mode === "raw" ? 1 : 100;
}

export function formatExperimentalScoreValue(value?: number) {
  if (typeof value !== "number") {
    return "-";
  }

  return value.toFixed(1);
}

export function languageBadgeTone(experimental: boolean) {
  if (experimental) {
    return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-300/20 dark:bg-amber-400/10 dark:text-amber-200";
  }

  return "border-teal-500/25 bg-teal-500/10 text-teal-700 dark:border-teal-300/20 dark:bg-teal-400/10 dark:text-teal-200";
}

export function entryHasCommunityLanguages(entry: ExperimentalLanguageBenchmarkEntry) {
  return Object.values(entry.languages).some((language) => language.experimental);
}

export function hasExperimentalBenchmarkData(entry: ExperimentalLanguageBenchmarkEntry) {
  return Object.values(entry.languages).some(
    (language) => language.experimental && language.status === "benchmarked",
  );
}

export function isExperimentalSizeCanceled(languageKey: string, size: BenchmarkSize) {
  return size === "large" && !experimentalLargeEnabledLanguages.has(languageKey);
}

export function getExperimentalSizeValue(entry: ExperimentalLanguageBenchmarkEntry, languageKey: string, size: BenchmarkSize) {
  return entry.languages[languageKey]?.results?.[size];
}

export function getExperimentalCompositeTiming(entry: ExperimentalLanguageBenchmarkEntry, size: BenchmarkSize) {
  const values = Object.values(entry.languages)
    .filter((language) => language.status === "benchmarked")
    .map((language) => language.results?.[size])
    .filter((value): value is number => typeof value === "number");

  if (!values.length) {
    return undefined;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}
