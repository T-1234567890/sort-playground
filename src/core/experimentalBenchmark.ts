import type { BenchmarkSize, ExperimentalLanguageBenchmarkEntry } from "./types";

export function formatExperimentalMetric(value?: number, unit = "ms") {
  if (typeof value !== "number") {
    return "-";
  }

  return `${value.toFixed(3)} ${unit}`;
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

export function getExperimentalSizeValue(entry: ExperimentalLanguageBenchmarkEntry, languageKey: string, size: BenchmarkSize) {
  return entry.languages[languageKey]?.results?.[size];
}
