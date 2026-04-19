import { average, roundMetric } from "./benchmark.js";
import { benchmarkLanguages, benchmarkProfileWeights, benchmarkProfiles, benchmarkSizes } from "./dataset.js";

function flattenWorkloadResults(workloadProfiles) {
  return benchmarkProfiles.flatMap((profile) =>
    benchmarkLanguages.flatMap((language) =>
      benchmarkSizes.map((size) => workloadProfiles?.[profile]?.[language]?.[size]).filter((value) => typeof value === "number"),
    ),
  );
}

function averageProfileResult(entry, profile, language) {
  return average(
    benchmarkSizes.map((size) => entry.snapshot?.workloadProfiles?.[profile]?.[language]?.[size]).filter((value) => typeof value === "number"),
  );
}

function averageSpreadRatio(results) {
  const values = benchmarkLanguages
    .map((language) => average(benchmarkSizes.map((size) => results?.[language]?.[size]).filter((value) => typeof value === "number")))
    .filter((value) => typeof value === "number");

  if (values.length < 2) {
    return undefined;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min <= 0) {
    return undefined;
  }

  return max / min;
}

function addDimensionBadges(dimensionScores, composite, spreadRatio) {
  const badges = [];
  const averageProfileScores = Object.fromEntries(
    benchmarkProfiles.map((profile) => [
      profile,
      average(benchmarkLanguages.map((language) => dimensionScores?.[language]?.[profile]).filter((value) => typeof value === "number")),
    ]),
  );

  if ((averageProfileScores["random-uniform"] ?? 0) >= 92) {
    badges.push("Fast Random");
  }

  if ((averageProfileScores["many-duplicates"] ?? 0) >= 92) {
    badges.push("Handles Duplicates Well");
  }

  if ((averageProfileScores["adversarial-pivot"] ?? 0) >= 92) {
    badges.push("Adversarial Ready");
  }

  if (typeof spreadRatio === "number" && spreadRatio <= 1.35) {
    badges.push("Cross-Language Balanced");
  }

  if (composite >= 95) {
    badges.push("Top Overall");
  }

  return badges;
}

export function computeScoreSnapshots(ranking) {
  const automatedEntries = ranking.filter((entry) => entry.mode === "automated" && entry.results && entry.snapshot?.workloadProfiles);

  if (!automatedEntries.length) {
    return;
  }

  const profileBaselines = Object.fromEntries(
    benchmarkLanguages.map((language) => [
      language,
      Object.fromEntries(
        benchmarkProfiles.map((profile) => [
          profile,
          Math.min(
            ...automatedEntries
              .map((entry) => averageProfileResult(entry, profile, language))
              .filter((value) => typeof value === "number"),
          ),
        ]),
      ),
    ]),
  );

  const sizeBaselines = Object.fromEntries(
    benchmarkLanguages.map((language) => [
      language,
      Object.fromEntries(
        benchmarkSizes.map((size) => [
          size,
          Math.min(
            ...automatedEntries
              .map((entry) => entry.results?.[language]?.[size])
              .filter((value) => typeof value === "number"),
          ),
        ]),
      ),
    ]),
  );

  for (const entry of automatedEntries) {
    const dimensionScores = Object.fromEntries(
      benchmarkLanguages.map((language) => [
        language,
        Object.fromEntries(
          benchmarkProfiles.map((profile) => {
            const profileAverage = averageProfileResult(entry, profile, language);
            const baseline = profileBaselines[language][profile];
            const score = typeof profileAverage === "number" && Number.isFinite(baseline)
              ? Math.max(0, Math.min(100, roundMetric((baseline / profileAverage) * 100, 1)))
              : undefined;
            return [profile, score];
          }),
        ),
      ]),
    );

    const sizeScores = Object.fromEntries(
      benchmarkLanguages.map((language) => [
        language,
        Object.fromEntries(
          benchmarkSizes.map((size) => {
            const value = entry.results?.[language]?.[size];
            const baseline = sizeBaselines[language][size];
            const score = typeof value === "number" && Number.isFinite(baseline)
              ? Math.max(0, Math.min(100, roundMetric((baseline / value) * 100, 1)))
              : undefined;
            return [size, score];
          }),
        ),
      ]),
    );

    const composite = benchmarkProfiles.reduce((sum, profile) => {
      const profileAverageScore = average(
        benchmarkLanguages.map((language) => dimensionScores?.[language]?.[profile]).filter((value) => typeof value === "number"),
      ) ?? 0;

      return sum + (profileAverageScore * benchmarkProfileWeights[profile]);
    }, 0) / benchmarkProfiles.reduce((sum, profile) => sum + benchmarkProfileWeights[profile], 0);

    const normalized = average(
      benchmarkLanguages.flatMap((language) =>
        benchmarkSizes.map((size) => sizeScores?.[language]?.[size]).filter((value) => typeof value === "number"),
      ),
    ) ?? composite;
    const rawAverage = average(flattenWorkloadResults(entry.snapshot?.workloadProfiles));

    entry.snapshot = {
      ...entry.snapshot,
      score: {
        rawAverageMs: typeof rawAverage === "number" ? roundMetric(rawAverage) : undefined,
        normalized: roundMetric(normalized, 1),
        composite: roundMetric(composite, 1),
        percentile: 0,
        badges: addDimensionBadges(dimensionScores, composite, averageSpreadRatio(entry.results)),
        dimensionScores,
        sizeScores,
      },
    };
  }

  const rankedByComposite = [...automatedEntries].sort(
    (left, right) =>
      (right.snapshot?.score?.composite ?? Number.NEGATIVE_INFINITY) -
        (left.snapshot?.score?.composite ?? Number.NEGATIVE_INFINITY) ||
      left.name.localeCompare(right.name),
  );

  for (const [index, entry] of rankedByComposite.entries()) {
    const percentile = rankedByComposite.length === 1 ? 100 : ((rankedByComposite.length - index - 1) / (rankedByComposite.length - 1)) * 100;

    entry.snapshot = {
      ...entry.snapshot,
      score: {
        ...entry.snapshot?.score,
        percentile: roundMetric(percentile, 1),
      },
    };
  }
}

export function sortRanking(ranking) {
  ranking.sort((left, right) => {
    if (left.mode === "none" && right.mode !== "none") {
      return 1;
    }

    if (left.mode !== "none" && right.mode === "none") {
      return -1;
    }

    if (left.mode === "automated" && right.mode === "estimated") {
      return -1;
    }

    if (left.mode === "estimated" && right.mode === "automated") {
      return 1;
    }

    if (left.mode === "estimated" && right.mode === "estimated") {
      const rankOrder = { high: 0, medium: 1, low: 2 };
      return rankOrder[left.relativeRank || "medium"] - rankOrder[right.relativeRank || "medium"] || left.name.localeCompare(right.name);
    }

    return (
      (right.snapshot?.score?.composite ?? Number.NEGATIVE_INFINITY) -
        (left.snapshot?.score?.composite ?? Number.NEGATIVE_INFINITY) ||
      left.name.localeCompare(right.name)
    );
  });
}
