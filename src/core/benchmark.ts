import type {
  BenchmarkLanguage,
  BenchmarkProfileScores,
  BenchmarkRankingEntry,
  BenchmarkSize,
  BenchmarkWorkloadProfile,
} from "./types";
import type { Settings } from "../hooks/useSettings";

export const benchmarkLanguages: BenchmarkLanguage[] = ["python", "rust", "c"];
export const benchmarkSizes: BenchmarkSize[] = ["small", "medium", "large"];
export const benchmarkProfiles: BenchmarkWorkloadProfile[] = [
  "random-uniform",
  "nearly-sorted",
  "reverse-sorted",
  "many-duplicates",
  "low-value-range",
  "adversarial-pivot",
];
export const benchmarkReferenceTimesMs: Record<BenchmarkSize, number> = {
  small: 0.1,
  medium: 1,
  large: 5,
};

export type BenchmarkScoreDisplayMode = Settings["scoreDisplay"];

export function getDisplayedBenchmarkScore(value?: number, mode: BenchmarkScoreDisplayMode = "processed") {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }

  if (value <= 0 || !Number.isFinite(value)) {
    return undefined;
  }

  return mode === "raw" ? value / 100 : value;
}

export function formatBenchmarkScore(value?: number, digits = 1, mode: BenchmarkScoreDisplayMode = "processed") {
  const displayed = getDisplayedBenchmarkScore(value, mode);

  if (typeof displayed !== "number") {
    return "-";
  }

  return displayed.toFixed(digits);
}

export function displayProfileScores(
  scores: BenchmarkProfileScores,
  mode: BenchmarkScoreDisplayMode = "processed",
): BenchmarkProfileScores {
  const displayed: BenchmarkProfileScores = {};

  for (const profile of benchmarkProfiles) {
    const value = getDisplayedBenchmarkScore(scores[profile], mode);

    if (typeof value === "number") {
      displayed[profile] = value;
    }
  }

  return displayed;
}

export function formatBenchmarkMetric(value?: number, unit = "ms") {
  if (typeof value !== "number") {
    return "-";
  }

  return `${value.toFixed(3)} ${unit}`;
}

export function clampScore(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return value;
}

function normalizeBenchmarkVisualScore(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return 1 / (1 + Math.exp(-((value - 100) / 24)));
}

export function getPerformanceColors(score?: number) {
  const normalized = normalizeBenchmarkVisualScore(score);
  const hue = 204 - normalized * 46;
  const saturation = 28 + normalized * 22;
  const lightness = 22 + normalized * 52;
  const foreground = normalized > 0.55 ? "rgb(13 22 34)" : "rgb(241 247 255)";
  const background = `hsl(${hue.toFixed(1)} ${saturation.toFixed(1)}% ${lightness.toFixed(1)}%)`;
  const border = `hsl(${hue.toFixed(1)} ${(saturation * 0.8).toFixed(1)}% ${(lightness * 0.82).toFixed(1)}%)`;

  return { background, border, foreground };
}

export function getDimensionScore(entry: BenchmarkRankingEntry | undefined, language: BenchmarkLanguage, profile: BenchmarkWorkloadProfile) {
  return entry?.snapshot?.score?.dimensionScores?.[language]?.[profile];
}

export function getSizeScore(entry: BenchmarkRankingEntry | undefined, language: BenchmarkLanguage, size: BenchmarkSize) {
  return entry?.snapshot?.score?.sizeScores?.[language]?.[size];
}

export function getCompositeScore(entry: BenchmarkRankingEntry | undefined) {
  return entry?.snapshot?.score?.composite;
}

export function isBenchmarkSizeCanceled(language: BenchmarkLanguage, size: BenchmarkSize) {
  return language === "python" && size === "large";
}

export function getBenchmarkSizeStatus(entry: BenchmarkRankingEntry | undefined, language: BenchmarkLanguage, size: BenchmarkSize) {
  if (typeof entry?.results?.[language]?.[size] === "number") {
    return "available";
  }

  if (isBenchmarkSizeCanceled(language, size)) {
    return "canceled";
  }

  return "missing";
}

export function getBenchmarkProfileMetric(
  entry: BenchmarkRankingEntry | undefined,
  profile: BenchmarkWorkloadProfile,
  language: BenchmarkLanguage,
  size: BenchmarkSize,
) {
  const profileValue = entry?.snapshot?.workloadProfiles?.[profile]?.[language]?.[size];

  if (typeof profileValue === "number") {
    return profileValue;
  }

  if (profile === "random-uniform") {
    return entry?.results?.[language]?.[size];
  }

  return undefined;
}

export function getBenchmarkProfileStatus(
  entry: BenchmarkRankingEntry | undefined,
  profile: BenchmarkWorkloadProfile,
  language: BenchmarkLanguage,
  size: BenchmarkSize,
) {
  if (typeof getBenchmarkProfileMetric(entry, profile, language, size) === "number") {
    return "available";
  }

  if (isBenchmarkSizeCanceled(language, size)) {
    return "canceled";
  }

  return "missing";
}

export function radarPoints(scores: BenchmarkProfileScores, radius: number, center: number) {
  return benchmarkProfiles
    .map((profile, index) => {
      const angle = (-Math.PI / 2) + (index * (Math.PI * 2)) / benchmarkProfiles.length;
      const value = normalizeBenchmarkVisualScore(scores[profile]);
      const x = center + Math.cos(angle) * radius * value;
      const y = center + Math.sin(angle) * radius * value;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function radarGridPoints(radius: number, center: number, scale = 1) {
  return benchmarkProfiles
    .map((_, index) => {
      const angle = (-Math.PI / 2) + (index * (Math.PI * 2)) / benchmarkProfiles.length;
      const x = center + Math.cos(angle) * radius * scale;
      const y = center + Math.sin(angle) * radius * scale;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function radarAxisPoint(radius: number, center: number, index: number, labelOffset = 20) {
  const angle = (-Math.PI / 2) + (index * (Math.PI * 2)) / benchmarkProfiles.length;

  return {
    x: center + Math.cos(angle) * (radius + labelOffset),
    y: center + Math.sin(angle) * (radius + labelOffset),
    lineX: center + Math.cos(angle) * radius,
    lineY: center + Math.sin(angle) * radius,
  };
}
