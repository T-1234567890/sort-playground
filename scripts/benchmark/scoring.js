import { average, roundMetric } from "./benchmark.js";
import { benchmarkLanguages, benchmarkProfiles, benchmarkReferenceTimesMs, benchmarkSizes } from "./dataset.js";

function flattenWorkloadResults(workloadProfiles) {
  return benchmarkProfiles.flatMap((profile) =>
    benchmarkLanguages.flatMap((language) =>
      benchmarkSizes.map((size) => workloadProfiles?.[profile]?.[language]?.[size]).filter((value) => typeof value === "number"),
    ),
  );
}

function isExcludedSize(entry, language, size) {
  return Boolean(entry?.snapshot?.harness?.languageSizeExclusions?.[language]?.[size]);
}

function requiredSizesForEntry(entry, language) {
  return benchmarkSizes.filter((size) => !isExcludedSize(entry, language, size));
}

function averageProfileResult(entry, profile, language) {
  return average(
    requiredSizesForEntry(entry, language)
      .map((size) => entry.snapshot?.workloadProfiles?.[profile]?.[language]?.[size])
      .filter((value) => typeof value === "number"),
  );
}

function averageReferenceForLanguage(entry, language) {
  return average(requiredSizesForEntry(entry, language).map((size) => benchmarkReferenceTimesMs[size]));
}

function averageSpreadRatio(entry) {
  const values = benchmarkLanguages
    .map((language) =>
      average(
        requiredSizesForEntry(entry, language)
          .map((size) => entry?.results?.[language]?.[size])
          .filter((value) => typeof value === "number"),
      ),
    )
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

  if ((averageProfileScores["random-uniform"] ?? 0) >= 2000) {
    badges.push("Fast Random");
  }

  if ((averageProfileScores["many-duplicates"] ?? 0) >= 2500) {
    badges.push("Handles Duplicates Well");
  }

  if ((averageProfileScores["adversarial-pivot"] ?? 0) >= 2000) {
    badges.push("Adversarial Ready");
  }

  if (typeof spreadRatio === "number" && spreadRatio <= 1.35) {
    badges.push("Cross-Language Balanced");
  }

  if ((composite ?? 0) >= 2500) {
    badges.push("Top Overall");
  }

  return badges;
}

function classifyAutomatedStatus(entry) {
  const hasAnyTiming = benchmarkProfiles.some((profile) =>
    benchmarkLanguages.some((language) =>
      benchmarkSizes.some((size) => typeof entry?.snapshot?.workloadProfiles?.[profile]?.[language]?.[size] === "number"),
    ),
  ) || benchmarkLanguages.some((language) =>
    benchmarkSizes.some((size) => typeof entry?.results?.[language]?.[size] === "number"),
  );

  if (!hasAnyTiming) {
    return "skipped";
  }

  const hasAllResults = benchmarkLanguages.every((language) =>
    requiredSizesForEntry(entry, language).every((size) => typeof entry?.results?.[language]?.[size] === "number"),
  );
  const hasAllProfiles = benchmarkProfiles.every((profile) =>
    benchmarkLanguages.every((language) =>
      requiredSizesForEntry(entry, language).every((size) => typeof entry?.snapshot?.workloadProfiles?.[profile]?.[language]?.[size] === "number"),
    ),
  );

  return hasAllResults && hasAllProfiles ? "benchmarked" : "partial";
}

function fixedReferenceScore(reference, measuredValue) {
  if (typeof reference !== "number" || typeof measuredValue !== "number" || measuredValue <= 0) {
    return undefined;
  }

  return roundMetric((reference / measuredValue) * 100, 3);
}

export function computeScoreSnapshots(ranking) {
  const automatedEntries = ranking.filter((entry) => entry.mode === "automated" && (entry.results || entry.snapshot?.workloadProfiles));

  if (!automatedEntries.length) {
    return;
  }

  for (const entry of automatedEntries) {
    const dimensionScores = Object.fromEntries(
      benchmarkLanguages.map((language) => [
        language,
        Object.fromEntries(
          benchmarkProfiles.map((profile) => {
            const profileAverage = averageProfileResult(entry, profile, language);
            const referenceAverage = averageReferenceForLanguage(entry, language);
            return [profile, fixedReferenceScore(referenceAverage, profileAverage)];
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
            return [size, fixedReferenceScore(benchmarkReferenceTimesMs[size], value)];
          }),
        ),
      ]),
    );

    const composite = average(
      benchmarkLanguages.flatMap((language) =>
        benchmarkProfiles.map((profile) => dimensionScores?.[language]?.[profile]).filter((value) => typeof value === "number"),
      ),
    );
    const normalized = average(
      benchmarkLanguages.flatMap((language) =>
        benchmarkSizes.map((size) => sizeScores?.[language]?.[size]).filter((value) => typeof value === "number"),
      ),
    );
    const rawAverage = average(flattenWorkloadResults(entry.snapshot?.workloadProfiles));
    const status = classifyAutomatedStatus(entry);

    entry.status = status;
    entry.snapshot = {
      ...entry.snapshot,
      score: {
        rawAverageMs: typeof rawAverage === "number" ? roundMetric(rawAverage) : undefined,
        normalized: typeof normalized === "number" ? roundMetric(normalized, 3) : undefined,
        composite: typeof composite === "number" ? roundMetric(composite, 3) : undefined,
        percentile: undefined,
        badges: addDimensionBadges(dimensionScores, composite, averageSpreadRatio(entry)),
        dimensionScores,
        sizeScores,
      },
    };
  }

  const rankedByComposite = [...automatedEntries]
    .filter((entry) => typeof entry.snapshot?.score?.composite === "number")
    .sort(
      (left, right) =>
        (right.snapshot?.score?.composite ?? Number.NEGATIVE_INFINITY) -
          (left.snapshot?.score?.composite ?? Number.NEGATIVE_INFINITY) ||
        left.name.localeCompare(right.name),
    );

  for (const entry of automatedEntries) {
    entry.snapshot = {
      ...entry.snapshot,
      score: {
        ...entry.snapshot?.score,
        percentile: undefined,
      },
    };
  }

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
