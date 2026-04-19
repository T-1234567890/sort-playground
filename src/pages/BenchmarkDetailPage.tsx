import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BenchmarkRadarChart } from "../components/BenchmarkRadarChart";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import {
  benchmarkLanguages,
  benchmarkProfiles,
  benchmarkSizes,
  formatBenchmarkMetric,
  getCompositeScore,
  getDimensionScore,
  getPerformanceColors,
  getSizeScore,
} from "../core/benchmark";
import type { BenchmarkLanguage, BenchmarkRankingEntry, BenchmarkSize } from "../core/types";

type BenchmarkDetailPageProps = {
  slug: string;
  dark: boolean;
  onToggleDark: () => void;
};

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  return response.json() as Promise<T>;
}

function formatDateTime(value?: string, locale?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale || undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function BenchmarkDetailPage({ slug, dark, onToggleDark }: BenchmarkDetailPageProps) {
  const { t, i18n } = useTranslation();
  const [entries, setEntries] = useState<BenchmarkRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<BenchmarkLanguage>("python");
  const [size, setSize] = useState<BenchmarkSize>("medium");

  useEffect(() => {
    let cancelled = false;

    async function loadBenchmark() {
      setLoading(true);

      try {
        const data = await readJson<BenchmarkRankingEntry[]>("/data/benchmark-ranking.json");

        if (!cancelled) {
          setEntries(data);
        }
      } catch {
        if (!cancelled) {
          setEntries([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBenchmark();

    return () => {
      cancelled = true;
    };
  }, []);

  const entry = useMemo(
    () => entries.find((item) => item.slug === slug && item.mode !== "none" && item.status !== "exempt"),
    [entries, slug],
  );
  const selectedResult = entry?.results?.[language]?.[size];
  const compositeScore = getCompositeScore(entry);
  const selectedSizeScore = getSizeScore(entry, language, size);
  const selectedColors = getPerformanceColors(selectedSizeScore ?? compositeScore);
  const compositeColors = getPerformanceColors(compositeScore);
  const radarScores = entry?.snapshot?.score?.dimensionScores?.[language] ?? {};
  const scoreBadges = entry?.snapshot?.score?.badges ?? [];
  const profileLabels = Object.fromEntries(benchmarkProfiles.map((profile) => [profile, t(`benchmark.profiles.${profile}`)]));
  const languageLabels = Object.fromEntries(benchmarkLanguages.map((item) => [item, t(`labs.benchmarkLanguages.${item}`)]));

  const dataFields = entry
    ? [
        { label: t("benchmarkDetail.fields.mode"), value: entry.mode },
        { label: t("benchmarkDetail.fields.status"), value: entry.status },
        { label: t("benchmarkDetail.fields.unit"), value: entry.unit ?? "-" },
        { label: t("benchmarkDetail.fields.source"), value: entry.metadata?.source ?? "-" },
        { label: t("benchmarkDetail.fields.lastRunAt"), value: formatDateTime(entry.metadata?.lastRunAt, i18n.language) },
        { label: t("benchmarkDetail.fields.lastRunMode"), value: entry.metadata?.lastRunMode ?? t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.algorithmHash"), value: entry.metadata?.algorithmHash ?? t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.reason"), value: entry.reason ?? t("benchmarkDetail.none") },
      ]
    : [];

  const environmentFields = entry
    ? [
        { label: t("benchmarkDetail.fields.specVersion"), value: entry.snapshot?.environment?.benchmarkSpecVersion ?? t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.runnerOs"), value: entry.snapshot?.environment?.runnerOs ?? t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.cpu"), value: entry.snapshot?.environment?.cpu ?? t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.nodeVersion"), value: entry.snapshot?.environment?.nodeVersion ?? t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.pythonVersion"), value: entry.snapshot?.environment?.pythonVersion ?? t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.rustVersion"), value: entry.snapshot?.environment?.rustVersion ?? t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.compilerVersion"), value: entry.snapshot?.environment?.compilerVersion ?? t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.workflowRun"), value: entry.snapshot?.environment?.workflowRunId ?? t("benchmarkDetail.none") },
      ]
    : [];

  const harnessFields = entry
    ? [
        { label: t("benchmarkDetail.fields.datasetGenerator"), value: entry.snapshot?.harness?.datasetGenerator ?? t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.datasetProfile"), value: entry.snapshot?.harness?.datasetProfile ?? t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.warmup"), value: entry.snapshot?.harness?.warmupPolicy ?? t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.runCount"), value: entry.snapshot?.harness?.runCountPolicy ?? t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.timeout"), value: entry.snapshot?.harness?.timeoutPolicy ?? t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.memory"), value: entry.snapshot?.harness?.memoryConstraints ?? t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.correctness"), value: entry.snapshot?.harness?.correctnessValidation ?? t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.runnerContract"), value: entry.snapshot?.harness?.languageRunnerContract ?? t("benchmarkDetail.none") },
      ]
    : [];

  const scoreFields = entry
    ? [
        { label: t("benchmarkDetail.fields.rawAverageMs"), value: typeof entry.snapshot?.score?.rawAverageMs === "number" ? formatBenchmarkMetric(entry.snapshot?.score?.rawAverageMs, entry.unit ?? "ms") : t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.normalized"), value: typeof entry.snapshot?.score?.normalized === "number" ? entry.snapshot.score.normalized.toFixed(1) : t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.composite"), value: typeof entry.snapshot?.score?.composite === "number" ? entry.snapshot.score.composite.toFixed(1) : t("benchmarkDetail.none") },
        { label: t("benchmarkDetail.fields.percentile"), value: typeof entry.snapshot?.score?.percentile === "number" ? entry.snapshot.score.percentile.toFixed(1) : t("benchmarkDetail.none") },
      ]
    : [];

  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <a
          data-route
          href="/labs/benchmark"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:-translate-x-0.5 dark:border-white/10 dark:bg-white/10"
        >
          <ArrowLeft size={16} />
          {t("benchmarkDetail.back")}
        </a>

        {loading ? (
          <section className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
            <p className="text-lg font-semibold">{t("labs.section.collectingTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("labs.section.benchmarkPlaceholder")}</p>
          </section>
        ) : !entry ? (
          <section className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
            <p className="text-lg font-semibold">{t("benchmarkDetail.missingTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("labs.section.benchmarkUnavailable")}</p>
          </section>
        ) : (
          <>
            <section className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-8 shadow-sm dark:border-white/10 dark:bg-white/8">
              <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">{t("benchmarkDetail.eyebrow")}</p>
              <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-5xl font-semibold tracking-tight">{entry.name}</h1>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                    <span className="rounded-lg border border-zinc-950/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/10">
                      {t("benchmarkDetail.slug")}: <span className="font-mono">{entry.slug}</span>
                    </span>
                    <span className="rounded-lg border border-zinc-950/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/10">
                      {t("benchmarkDetail.mode")}: {entry.mode}
                    </span>
                    <span className="rounded-lg border border-zinc-950/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/10">
                      {t("benchmarkDetail.status")}: {entry.status}
                    </span>
                    <span className="rounded-lg border border-zinc-950/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/10">
                      {t("benchmarkDetail.fields.lastRunAt")}: {formatDateTime(entry.metadata?.lastRunAt, i18n.language)}
                    </span>
                  </div>
                  <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmarkDetail.summary")}</p>
                </div>

                <div
                  className="rounded-2xl border px-5 py-4"
                  style={{
                    backgroundColor: compositeColors.background,
                    borderColor: compositeColors.border,
                    color: compositeColors.foreground,
                  }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em]">{t("benchmarkDetail.compositeTitle")}</p>
                  <p className="mt-2 text-4xl font-semibold">{typeof compositeScore === "number" ? compositeScore.toFixed(1) : "-"}</p>
                  <p className="mt-2 text-sm opacity-80">{t("benchmarkDetail.compositeDescription")}</p>
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
              <div className="grid gap-5">
                <section className="rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                        {t("benchmarkDetail.selectedRanking")}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{t("benchmarkDetail.selectedTitle")}</h2>
                    </div>
                    <div
                      className="rounded-full border px-3 py-1 text-sm font-semibold"
                      style={{
                        backgroundColor: selectedColors.background,
                        borderColor: selectedColors.border,
                        color: selectedColors.foreground,
                      }}
                    >
                      {typeof selectedSizeScore === "number" ? selectedSizeScore.toFixed(1) : t("benchmarkDetail.none")}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {t("benchmarkDetail.selectedRankingDescription", {
                      language: t(`labs.benchmarkLanguages.${language}`),
                      size: t(`labs.benchmarkSizes.${size}`),
                    })}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {benchmarkLanguages.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setLanguage(item)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                          language === item
                            ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                            : "border border-zinc-950/10 bg-white/70 text-zinc-700 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
                        }`}
                      >
                        {t(`labs.benchmarkLanguages.${item}`)}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {benchmarkSizes.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSize(item)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                          size === item
                            ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                            : "border border-zinc-950/10 bg-white/70 text-zinc-700 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
                        }`}
                      >
                        {t(`labs.benchmarkSizes.${item}`)}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="rounded-lg bg-zinc-50/90 p-5 dark:bg-zinc-950/30">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                        {t("benchmarkDetail.selectedMetric")}
                      </p>
                      <p className="mt-3 font-mono text-4xl font-semibold">{formatBenchmarkMetric(selectedResult, entry.unit ?? "ms")}</p>
                      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                        {t("benchmarkDetail.sizeScore")} {typeof selectedSizeScore === "number" ? selectedSizeScore.toFixed(1) : t("benchmarkDetail.none")}
                      </p>
                    </div>

                    <BenchmarkRadarChart
                      scores={radarScores}
                      language={language}
                      unitLabel={t("benchmarkDetail.radarTitle")}
                      labels={{ ...profileLabels, ...languageLabels }}
                    />
                  </div>
                </section>

                <section className="rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
                  <h2 className="text-2xl font-semibold tracking-tight">{t("benchmarkDetail.resultsTitle")}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmarkDetail.resultsDescription")}</p>

                  <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    {benchmarkLanguages.map((languageKey) => (
                      <div key={languageKey} className="rounded-lg border border-zinc-950/8 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-zinc-950/20">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold">{t(`labs.benchmarkLanguages.${languageKey}`)}</p>
                          <span
                            className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                            style={{
                              backgroundColor: getPerformanceColors(getSizeScore(entry, languageKey, size) ?? compositeScore).background,
                              borderColor: getPerformanceColors(getSizeScore(entry, languageKey, size) ?? compositeScore).border,
                              color: getPerformanceColors(getSizeScore(entry, languageKey, size) ?? compositeScore).foreground,
                            }}
                          >
                            {typeof getSizeScore(entry, languageKey, size) === "number" ? getSizeScore(entry, languageKey, size)?.toFixed(1) : t("benchmarkDetail.none")}
                          </span>
                        </div>
                        <div className="mt-4 space-y-3">
                          {benchmarkSizes.map((sizeKey) => (
                            <div key={sizeKey} className="flex items-center justify-between gap-4">
                              <span className="text-sm text-zinc-500 dark:text-zinc-400">{t(`labs.benchmarkSizes.${sizeKey}`)}</span>
                              <span className="font-mono text-sm font-semibold">
                                {formatBenchmarkMetric(entry.results?.[languageKey]?.[sizeKey], entry.unit ?? "ms")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
                  <h2 className="text-2xl font-semibold tracking-tight">{t("benchmarkDetail.profileTitle")}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmarkDetail.profileDescription")}</p>

                  <div className="mt-6 overflow-hidden rounded-lg border border-zinc-950/8 dark:border-white/10">
                    <div className="grid grid-cols-[minmax(0,1.6fr)_120px_repeat(3,minmax(0,0.9fr))] gap-3 bg-zinc-950/[0.03] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:bg-white/[0.03] dark:text-zinc-400">
                      <span>{t("benchmarkDetail.table.dimension")}</span>
                      <span>{t("benchmarkDetail.table.score")}</span>
                      <span>{t("labs.benchmarkSizes.small")}</span>
                      <span>{t("labs.benchmarkSizes.medium")}</span>
                      <span>{t("labs.benchmarkSizes.large")}</span>
                    </div>
                    <div className="divide-y divide-zinc-950/8 dark:divide-white/10">
                      {benchmarkProfiles.map((profile) => {
                        const profileScore = getDimensionScore(entry, language, profile);
                        const colors = getPerformanceColors(profileScore);

                        return (
                          <div key={profile} className="grid grid-cols-[minmax(0,1.6fr)_120px_repeat(3,minmax(0,0.9fr))] gap-3 px-4 py-4 text-sm">
                            <div className="font-medium">{profileLabels[profile]}</div>
                            <div>
                              <span
                                className="rounded-full border px-2.5 py-1 text-xs font-semibold"
                                style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }}
                              >
                                {typeof profileScore === "number" ? profileScore.toFixed(1) : t("benchmarkDetail.none")}
                              </span>
                            </div>
                            {benchmarkSizes.map((sizeKey) => (
                              <div key={sizeKey} className="font-mono text-xs sm:text-sm">
                                {formatBenchmarkMetric(entry.snapshot?.workloadProfiles?.[profile]?.[language]?.[sizeKey], entry.unit ?? "ms")}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
                  <h2 className="text-2xl font-semibold tracking-tight">{t("benchmarkDetail.snapshotTitle")}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmarkDetail.snapshotDescription")}</p>

                  <div className="mt-6 grid gap-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                        {t("benchmarkDetail.environmentTitle")}
                      </p>
                      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                        {environmentFields.map((field) => (
                          <div key={field.label}>
                            <dt className="font-semibold">{field.label}</dt>
                            <dd className="mt-1 text-zinc-600 dark:text-zinc-300">{field.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                        {t("benchmarkDetail.harnessTitle")}
                      </p>
                      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                        {harnessFields.map((field) => (
                          <div key={field.label}>
                            <dt className="font-semibold">{field.label}</dt>
                            <dd className="mt-1 text-zinc-600 dark:text-zinc-300">{field.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                </section>
              </div>

              <div className="grid gap-5">
                <section className="rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
                  <h2 className="text-xl font-semibold tracking-tight">{t("benchmarkDetail.dataTitle")}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmarkDetail.dataDescription")}</p>
                  <dl className="mt-4 grid gap-3 text-sm">
                    {dataFields.map((field) => (
                      <div key={field.label}>
                        <dt className="font-semibold">{field.label}</dt>
                        <dd className="mt-1 break-all text-zinc-600 dark:text-zinc-300">{field.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <section className="rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
                  <h2 className="text-xl font-semibold tracking-tight">{t("benchmarkDetail.scoreTitle")}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmarkDetail.scoreDescription")}</p>
                  <dl className="mt-4 grid gap-3 text-sm">
                    {scoreFields.map((field) => (
                      <div key={field.label}>
                        <dt className="font-semibold">{field.label}</dt>
                        <dd className="mt-1 text-zinc-600 dark:text-zinc-300">{field.value}</dd>
                      </div>
                    ))}
                    <div>
                      <dt className="font-semibold">{t("benchmarkDetail.fields.badges")}</dt>
                      <dd className="mt-2 flex flex-wrap gap-2">
                        {scoreBadges.length > 0 ? (
                          scoreBadges.map((badge) => {
                            const colors = getPerformanceColors(compositeScore);

                            return (
                              <span
                                key={badge}
                                className="rounded-full border px-2.5 py-1 text-xs font-semibold"
                                style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }}
                              >
                                {badge}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-zinc-600 dark:text-zinc-300">{t("benchmarkDetail.none")}</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </Shell>
  );
}
