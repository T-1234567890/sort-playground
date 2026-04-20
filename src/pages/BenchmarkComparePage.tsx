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
  getBenchmarkSizeStatus,
  getCompositeScore,
  getDimensionScore,
  getSizeScore,
  isBenchmarkSizeCanceled,
} from "../core/benchmark";
import type { BenchmarkLanguage, BenchmarkRankingEntry, BenchmarkSize } from "../core/types";

type BenchmarkComparePageProps = {
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

function selectedSlugsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("items") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 4);
}

export function BenchmarkComparePage({ dark, onToggleDark }: BenchmarkComparePageProps) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<BenchmarkRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<BenchmarkLanguage>("python");
  const [size, setSize] = useState<BenchmarkSize>("medium");
  const selectedSlugs = useMemo(() => selectedSlugsFromUrl(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
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

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedEntries = useMemo(
    () =>
      selectedSlugs
        .map((slug) => entries.find((entry) => entry.slug === slug && entry.mode === "automated" && entry.status === "benchmarked"))
        .filter((entry): entry is BenchmarkRankingEntry => Boolean(entry)),
    [entries, selectedSlugs],
  );

  const profileLabels = Object.fromEntries(
    benchmarkProfiles.map((profile) => [profile, t(`benchmark.profiles.${profile}`, { defaultValue: profile })]),
  );
  const languageLabels = Object.fromEntries(benchmarkLanguages.map((item) => [item, t(`labs.benchmarkLanguages.${item}`)]));

  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main className="mx-auto max-w-7xl px-5 py-10">
        <a
          data-route
          href="/labs/benchmark"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:-translate-x-0.5 dark:border-white/10 dark:bg-white/10"
        >
          <ArrowLeft size={16} />
          {t("benchmarkCompare.back", { defaultValue: "Back to Benchmark" })}
        </a>

        <section className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-8 shadow-sm dark:border-white/10 dark:bg-white/8">
          <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">
            {t("benchmarkCompare.eyebrow", { defaultValue: "Benchmark Compare" })}
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight">{t("benchmarkCompare.title", { defaultValue: "Compare benchmark results" })}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {t("benchmarkCompare.description", { defaultValue: "Compare up to four benchmarked algorithms side by side." })}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {benchmarkLanguages.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setLanguage(item);
                  if (item === "python" && size === "large") {
                    setSize("medium");
                  }
                }}
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
                disabled={isBenchmarkSizeCanceled(language, item)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  size === item
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                    : isBenchmarkSizeCanceled(language, item)
                      ? "cursor-not-allowed border border-zinc-950/10 bg-zinc-100 text-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-500"
                      : "border border-zinc-950/10 bg-white/70 text-zinc-700 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
                }`}
              >
                {t(`labs.benchmarkSizes.${item}`)}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <section className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
            <p className="text-lg font-semibold">{t("labs.section.collectingTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("labs.section.benchmarkPlaceholder")}</p>
          </section>
        ) : selectedEntries.length < 2 ? (
          <section className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
            <p className="text-lg font-semibold">{t("benchmarkCompare.missingTitle", { defaultValue: "Pick at least two algorithms" })}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {t("benchmarkCompare.missingDescription", { defaultValue: "Go back to the benchmark list and select between two and four algorithms to compare." })}
            </p>
          </section>
        ) : (
          <>
            <section className="mt-8 grid gap-5 xl:grid-cols-2">
              {selectedEntries.map((entry) => {
                const sizeScore = getSizeScore(entry, language, size);
                const compositeScore = getCompositeScore(entry);

                return (
                  <div key={entry.slug} className="rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <a data-route href={`/labs/benchmark/${entry.slug}`} className="text-2xl font-semibold tracking-tight hover:text-teal-600 dark:hover:text-teal-300">
                          {entry.name}
                        </a>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{entry.slug}</p>
                      </div>
                      <span className="rounded-full border border-zinc-950/10 bg-zinc-50 px-3 py-1 text-xs font-semibold dark:border-white/10 dark:bg-white/10">
                        {t("benchmarkCompare.selectedMetric", { defaultValue: "Selected metric" })}:{" "}
                        {typeof sizeScore === "number" ? sizeScore.toFixed(1) : "-"}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-zinc-950/[0.04] p-4 dark:bg-white/[0.06]">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                          {t("benchmarkDetail.fields.composite", { defaultValue: "Composite" })}
                        </p>
                        <p className="mt-2 text-3xl font-semibold">{typeof compositeScore === "number" ? compositeScore.toFixed(1) : "-"}</p>
                      </div>
                      <div className="rounded-lg bg-zinc-950/[0.04] p-4 dark:bg-white/[0.06]">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                          {t("benchmarkCompare.current", { defaultValue: "Current view" })}
                        </p>
                        <p className="mt-2 text-3xl font-semibold">
                          {getBenchmarkSizeStatus(entry, language, size) === "available"
                            ? formatBenchmarkMetric(entry.results?.[language]?.[size], entry.unit ?? "ms")
                            : t("benchmark.status.canceled", { defaultValue: "Canceled" })}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-2 text-sm">
                      {benchmarkSizes.map((sizeKey) => (
                        <div key={sizeKey} className="flex items-center justify-between gap-4">
                          <span className="text-zinc-500 dark:text-zinc-400">{t(`labs.benchmarkSizes.${sizeKey}`)}</span>
                          <span className="font-mono font-semibold">
                            {getBenchmarkSizeStatus(entry, language, sizeKey) === "available"
                              ? formatBenchmarkMetric(entry.results?.[language]?.[sizeKey], entry.unit ?? "ms")
                              : t("benchmark.status.canceled", { defaultValue: "Canceled" })}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5">
                      <BenchmarkRadarChart
                        scores={entry.snapshot?.score?.dimensionScores?.[language] ?? {}}
                        language={language}
                        unitLabel={t("benchmarkCompare.dimensionScores", { defaultValue: "Dimension scores" })}
                        labels={{ ...profileLabels, ...languageLabels }}
                      />
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="mt-8 overflow-hidden rounded-lg border border-zinc-950/10 bg-white/72 shadow-sm dark:border-white/10 dark:bg-white/8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-950/8 dark:divide-white/10">
                  <thead className="bg-zinc-950/[0.03] dark:bg-white/[0.03]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                        {t("benchmarkCompare.metric", { defaultValue: "Metric" })}
                      </th>
                      {selectedEntries.map((entry) => (
                        <th key={entry.slug} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                          {entry.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-950/8 dark:divide-white/10">
                    <tr>
                      <td className="px-4 py-3 font-semibold">{t("benchmarkDetail.fields.composite", { defaultValue: "Composite" })}</td>
                      {selectedEntries.map((entry) => (
                        <td key={entry.slug} className="px-4 py-3 font-mono">{typeof getCompositeScore(entry) === "number" ? getCompositeScore(entry)?.toFixed(1) : "-"}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold">
                        {t("benchmarkCompare.currentLabel", {
                          defaultValue: "{{language}} / {{size}}",
                          language: t(`labs.benchmarkLanguages.${language}`),
                          size: t(`labs.benchmarkSizes.${size}`),
                        })}
                      </td>
                      {selectedEntries.map((entry) => (
                        <td key={entry.slug} className="px-4 py-3 font-mono">
                          {getBenchmarkSizeStatus(entry, language, size) === "available"
                            ? formatBenchmarkMetric(entry.results?.[language]?.[size], entry.unit ?? "ms")
                            : t("benchmark.status.canceled", { defaultValue: "Canceled" })}
                        </td>
                      ))}
                    </tr>
                    {benchmarkProfiles.map((profile) => (
                      <tr key={profile}>
                        <td className="px-4 py-3 font-semibold">{profileLabels[profile]}</td>
                        {selectedEntries.map((entry) => (
                          <td key={entry.slug} className="px-4 py-3 font-mono">
                            {typeof getDimensionScore(entry, language, profile) === "number"
                              ? getDimensionScore(entry, language, profile)?.toFixed(1)
                              : "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </Shell>
  );
}
