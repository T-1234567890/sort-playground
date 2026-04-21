import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import { getDisplayedBenchmarkScore } from "../core/benchmark";
import { useSettings } from "../hooks/useSettings";
import type { BenchmarkRankingEntry } from "../core/types";

type BenchmarkScalePageProps = {
  dark: boolean;
  onToggleDark: () => void;
};

type ScoreSummary = {
  count: number;
  min: number;
  max: number;
  median: number;
  p25: number;
  p75: number;
  baseline: number;
};

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  return response.json() as Promise<T>;
}

function quantile(sortedValues: number[], p: number) {
  if (!sortedValues.length) {
    return undefined;
  }

  const index = (sortedValues.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sortedValues[lower];
  }

  const weight = index - lower;
  return sortedValues[lower] + ((sortedValues[upper] - sortedValues[lower]) * weight);
}

function scoreSummaryFrom(entries: BenchmarkRankingEntry[], baseline: number, scoreDisplay: "processed" | "raw"): ScoreSummary | undefined {
  const scores = entries
    .map((entry) => getDisplayedBenchmarkScore(entry.snapshot?.score?.composite, scoreDisplay))
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value))
    .sort((left, right) => left - right);

  if (!scores.length) {
    return undefined;
  }

  const min = scores[0];
  const max = scores[scores.length - 1];
  const median = quantile(scores, 0.5) ?? min;
  const p25 = quantile(scores, 0.25) ?? min;
  const p75 = quantile(scores, 0.75) ?? max;

  return {
    count: scores.length,
    min,
    max,
    median,
    p25,
    p75,
    baseline,
  };
}

function positionForScore(score: number, min: number, max: number) {
  if (max <= min) {
    return 50;
  }

  return ((score - min) / (max - min)) * 100;
}

function formatScore(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return value.toFixed(1);
}

export function BenchmarkScalePage({ dark, onToggleDark }: BenchmarkScalePageProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [entries, setEntries] = useState<BenchmarkRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

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

  const baseline = settings.scoreDisplay === "raw" ? 1 : 100;
  const summary = useMemo(() => scoreSummaryFrom(entries, baseline, settings.scoreDisplay), [baseline, entries, settings.scoreDisplay]);
  const formulaExpression = settings.scoreDisplay === "raw"
    ? "score = reference / measured_time"
    : "score = (reference / measured_time) * 100";

  const rangeBands = useMemo(() => {
    if (!summary) {
      return [];
    }

    return [
      {
        key: "slower",
        title: t("benchmarkScale.ranges.slower.title"),
        description: t("benchmarkScale.ranges.slower.description"),
        from: summary.min,
        to: summary.p25,
        fill: "from-emerald-950 via-emerald-900 to-emerald-800 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-800",
      },
      {
        key: "steady",
        title: t("benchmarkScale.ranges.steady.title"),
        description: t("benchmarkScale.ranges.steady.description"),
        from: summary.p25,
        to: summary.p75,
        fill: "from-emerald-700 via-emerald-500 to-emerald-400 dark:from-emerald-700 dark:via-emerald-500 dark:to-emerald-400",
      },
      {
        key: "faster",
        title: t("benchmarkScale.ranges.faster.title"),
        description: t("benchmarkScale.ranges.faster.description"),
        from: summary.p75,
        to: summary.max,
        fill: "from-emerald-300 via-emerald-200 to-mint-100 dark:from-emerald-300 dark:via-emerald-200 dark:to-emerald-100",
      },
    ];
  }, [summary, t]);

  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main className="px-5 py-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <a
            data-route
            href="/benchmark"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:-translate-x-0.5 dark:border-white/10 dark:bg-white/10"
          >
            <ArrowLeft size={16} />
            {t("benchmarkScale.back")}
          </a>
        </div>

        <section className="mx-auto mt-8 max-w-6xl rounded-[2rem] bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(255,255,255,0.96)_36%,rgba(255,255,255,1)_100%)] px-6 py-14 dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.18),rgba(9,9,11,0.94)_36%,rgba(9,9,11,1)_100%)] sm:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
              {t("benchmarkScale.eyebrow")}
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
              {t("benchmarkScale.title")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg">
              {t("benchmarkScale.description")}
            </p>
          </div>
        </section>

        {loading ? (
          <section className="mx-auto mt-10 max-w-6xl rounded-2xl border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
            <p className="text-lg font-semibold">{t("benchmarkScale.loadingTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmarkScale.loadingDescription")}</p>
          </section>
        ) : !summary ? (
          <section className="mx-auto mt-10 max-w-6xl rounded-2xl border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
            <p className="text-lg font-semibold">{t("benchmarkScale.emptyTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmarkScale.emptyDescription")}</p>
          </section>
        ) : (
          <div className="mx-auto mt-10 max-w-6xl space-y-8">
            <section className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="rounded-2xl border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                  {t("benchmarkScale.scale.label")}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  {t("benchmarkScale.scale.title")}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {t("benchmarkScale.scale.description")}
                </p>

                <div className="mt-8">
                  <div className="w-full overflow-hidden rounded-[2rem] border border-emerald-700/10 bg-white/80 p-3 shadow-[0_18px_40px_rgba(16,185,129,0.1)] dark:border-emerald-300/10 dark:bg-white/[0.04]">
                    <div className="flex min-h-[4.75rem] w-full overflow-hidden rounded-[1.6rem]">
                      {rangeBands.map((band) => (
                        <div
                          key={band.key}
                          className={`flex min-w-0 flex-1 items-center justify-center bg-gradient-to-r ${band.fill}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {rangeBands.map((band) => (
                    <div key={band.key} className="rounded-2xl bg-zinc-950/[0.04] px-4 py-4 dark:bg-white/[0.05]">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{band.title}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                        {formatScore(band.from)} to {formatScore(band.to)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{band.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <section className="rounded-2xl border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                    {t("benchmarkScale.meaning.label")}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">{t("benchmarkScale.meaning.title")}</h2>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    <p>{t("benchmarkScale.meaning.line1")}</p>
                    <p>{t("benchmarkScale.meaning.line2", { baseline })}</p>
                    <p>{t("benchmarkScale.meaning.line3")}</p>
                  </div>
                </section>

                <section className="rounded-2xl border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                    {t("benchmarkScale.formula.label")}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">{t("benchmarkScale.formula.title")}</h2>
                  <div className="mt-5 rounded-2xl border border-emerald-700/15 bg-emerald-500/[0.07] px-5 py-4 font-mono text-sm text-zinc-800 dark:border-emerald-300/15 dark:bg-emerald-400/[0.08] dark:text-zinc-100">
                    {formulaExpression}
                  </div>
                </section>

                <section className="rounded-2xl border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                    {t("benchmarkScale.notes.label")}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">{t("benchmarkScale.notes.title")}</h2>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    <li>{t("benchmarkScale.notes.items.uncapped")}</li>
                    <li>{t("benchmarkScale.notes.items.measuredTime")}</li>
                    <li>{t("benchmarkScale.notes.items.distribution")}</li>
                  </ul>
                </section>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: t("benchmarkScale.stats.min"), value: summary.min },
                  { label: t("benchmarkScale.stats.baseline"), value: summary.baseline },
                  { label: t("benchmarkScale.stats.median"), value: summary.median },
                  { label: t("benchmarkScale.stats.max"), value: summary.max },
                  { label: t("benchmarkScale.stats.entries"), value: summary.count, integer: true },
                ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-zinc-950/10 bg-white/72 p-5 shadow-sm dark:border-white/10 dark:bg-white/8">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold">
                    {item.integer ? item.value : formatScore(item.value)}
                  </p>
                </div>
              ))}
            </section>

          </div>
        )}
      </main>
      <Footer />
    </Shell>
  );
}
