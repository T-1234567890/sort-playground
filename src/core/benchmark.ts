import type {
  BenchmarkLanguage,
  BenchmarkProfileScores,
  BenchmarkRankingEntry,
  BenchmarkSize,
  BenchmarkWorkloadProfile,
} from "./types";

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

  return Math.max(0, Math.min(100, value));
}

export function getPerformanceColors(score?: number) {
  const normalized = clampScore(score) / 100;
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
      const value = clampScore(scores[profile]) / 100;
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
