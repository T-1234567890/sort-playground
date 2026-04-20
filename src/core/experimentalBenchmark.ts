import type { BenchmarkSize, ExperimentalLanguageBenchmarkEntry } from "./types";

const experimentalLargeEnabledLanguages = new Set(["go", "java", "cpp", "swift", "zig"]);

export function formatExperimentalMetric(value?: number, unit = "ms") {
  if (typeof value !== "number") {
    return "-";
  }

  return `${value.toFixed(3)} ${unit}`;
}

export function formatExperimentalScore(value?: number) {
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

export function getExperimentalCompositeScore(
  entry: ExperimentalLanguageBenchmarkEntry,
  entries: ExperimentalLanguageBenchmarkEntry[],
  size: BenchmarkSize,
) {
  const timing = getExperimentalCompositeTiming(entry, size);

  if (typeof timing !== "number") {
    return entry.metadata?.mainBenchmarkCompositeScore;
  }

  const timings = entries
    .map((item) => getExperimentalCompositeTiming(item, size))
    .filter((value): value is number => typeof value === "number")
    .sort((left, right) => left - right);

  if (timings.length < 2) {
    return entry.metadata?.mainBenchmarkCompositeScore;
  }

  const best = timings[0];
  const worst = timings[timings.length - 1];

  if (best === worst) {
    return entry.metadata?.mainBenchmarkCompositeScore ?? 100;
  }

  return ((worst - timing) / (worst - best)) * 100;
}

export function getExperimentalOverviewScore(entry: ExperimentalLanguageBenchmarkEntry, entries: ExperimentalLanguageBenchmarkEntry[]) {
  void entries;
  return entry.metadata?.mainBenchmarkCompositeScore;
}
