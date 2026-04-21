import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import { benchmarkSizes } from "../core/benchmark";
import { formatExperimentalMetric, formatExperimentalScore, getExperimentalOverviewScore, hasExperimentalBenchmarkData, isExperimentalSizeCanceled } from "../core/experimentalBenchmark";
import { useSettings } from "../hooks/useSettings";
import type { BenchmarkRankingEntry, BenchmarkSize, ExperimentalLanguageBenchmarkEntry } from "../core/types";

type LanguageBenchmarkComparePageProps = {
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

function formatShortLanguageLabel(languageKey: string, label: string) {
  if (languageKey === "javascript") {
    return "JS";
  }

  if (languageKey === "typescript") {
    return "TS";
  }

  return label;
}

export function LanguageBenchmarkComparePage({ dark, onToggleDark }: LanguageBenchmarkComparePageProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [entries, setEntries] = useState<ExperimentalLanguageBenchmarkEntry[]>([]);
  const [mainEntries, setMainEntries] = useState<BenchmarkRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState<BenchmarkSize>("medium");
  const selectedSlugs = useMemo(() => selectedSlugsFromUrl(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);

      try {
        const [languageData, mainBenchmarkData] = await Promise.all([
          readJson<ExperimentalLanguageBenchmarkEntry[]>("/data/benchmark-languages.json"),
          readJson<BenchmarkRankingEntry[]>("/data/benchmark-ranking.json").catch(() => []),
        ]);

        if (!cancelled) {
          setEntries(languageData);
          setMainEntries(mainBenchmarkData);
        }
      } catch {
        if (!cancelled) {
          setEntries([]);
          setMainEntries([]);
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

  const mainCompositeBySlug = useMemo(
    () => new Map(mainEntries.map((entry) => [entry.slug, entry.snapshot?.score?.composite])),
    [mainEntries],
  );

  const selectedEntries = useMemo(
    () =>
      selectedSlugs
        .map((slug) => entries.find((entry) => entry.slug === slug && hasExperimentalBenchmarkData(entry)))
        .filter((entry): entry is ExperimentalLanguageBenchmarkEntry => Boolean(entry)),
    [entries, selectedSlugs],
  );

  const allLanguageKeys = useMemo(
    () =>
      [...new Set(selectedEntries.flatMap((entry) => Object.keys(entry.languages)))]
        .filter((languageKey) =>
          selectedEntries.some((entry) => entry.languages[languageKey]?.experimental || entry.languages[languageKey]?.status === "benchmarked"),
        )
        .sort((left, right) => left.localeCompare(right)),
    [selectedEntries],
  );

  function getOverviewScore(entry: ExperimentalLanguageBenchmarkEntry) {
    const score = getExperimentalOverviewScore(entry);

    if (typeof score === "number") {
      return score;
    }

    const mainScore = mainCompositeBySlug.get(entry.slug);
    return typeof mainScore === "number" ? mainScore : undefined;
  }

  function getLanguageValue(entry: ExperimentalLanguageBenchmarkEntry, languageKey: string) {
    const language = entry.languages[languageKey];

    if (!language || language.status === "unsupported" || language.status === "missing") {
      return "-";
    }

    if (language.experimental && isExperimentalSizeCanceled(languageKey, size)) {
      return t("languageBenchmark.canceled", { defaultValue: "Canceled" });
    }

    return formatExperimentalMetric(language.results?.[size], entry.unit);
  }

  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main className="mx-auto max-w-7xl px-5 py-10">
        <a
          data-route
          href="/labs/benchmark/languages"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:-translate-x-0.5 dark:border-white/10 dark:bg-white/10"
        >
          <ArrowLeft size={16} />
          {t("languageBenchmarkCompare.back", { defaultValue: "Back to Language Benchmark" })}
        </a>

        <section className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-8 shadow-sm dark:border-white/10 dark:bg-white/8">
          <p className="text-sm font-semibold uppercase text-amber-700 dark:text-amber-300">
            {t("languageBenchmarkCompare.eyebrow", { defaultValue: "Language Benchmark Compare" })}
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight">{t("languageBenchmarkCompare.title", { defaultValue: "Compare multi-language results" })}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {t("languageBenchmarkCompare.description", { defaultValue: "Compare up to four algorithms across the main and community language benchmark views." })}
          </p>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            {t("languageBenchmarkCompare.selectionNote", {
              defaultValue: "Current comparison size: {{size}}. Each metric row is a language, and each algorithm column shows that language's result.",
              size: t(`labs.benchmarkSizes.${size}`),
            })}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
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
        </section>

        {loading ? (
          <section className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
            <p className="text-lg font-semibold">{t("labs.section.collectingTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("languageBenchmark.placeholder")}</p>
          </section>
        ) : selectedEntries.length < 2 ? (
          <section className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
            <p className="text-lg font-semibold">{t("languageBenchmarkCompare.missingTitle", { defaultValue: "Pick at least two algorithms" })}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {t("languageBenchmarkCompare.missingDescription", { defaultValue: "Go back to the language benchmark list and select between two and four algorithms to compare." })}
            </p>
          </section>
        ) : (
          <>
            <section className="mt-8 grid gap-5 xl:grid-cols-2">
              {selectedEntries.map((entry) => (
                <div key={entry.slug} className="rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
                  <a data-route href={`/labs/benchmark/languages/${entry.slug}`} className="text-2xl font-semibold tracking-tight hover:text-amber-700 dark:hover:text-amber-300">
                    {entry.name}
                  </a>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{entry.slug}</p>

                  <div className="mt-5 rounded-lg bg-zinc-950/[0.04] p-4 dark:bg-white/[0.06]">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                      {t("languageBenchmark.overallScore", { defaultValue: "Overall score" })}
                    </p>
                    <p className="mt-2 text-3xl font-semibold">
                      {typeof getOverviewScore(entry) === "number" ? formatExperimentalScore(getOverviewScore(entry), settings.scoreDisplay) : "-"}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-2 text-sm">
                    {allLanguageKeys.map((languageKey) => {
                      const language = entry.languages[languageKey];
                      return (
                        <div key={languageKey} className="flex items-center justify-between gap-4">
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {formatShortLanguageLabel(languageKey, language?.label ?? languageKey)}
                          </span>
                          <span className="font-mono font-semibold">{getLanguageValue(entry, languageKey)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>

            <section className="mt-8 overflow-hidden rounded-lg border border-zinc-950/10 bg-white/72 shadow-sm dark:border-white/10 dark:bg-white/8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-950/8 dark:divide-white/10">
                  <thead className="bg-zinc-950/[0.03] dark:bg-white/[0.03]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                        {t("languageBenchmarkCompare.metric", { defaultValue: "Language / metric" })}
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
                      <td className="px-4 py-3 font-semibold">{t("languageBenchmark.overallScore", { defaultValue: "Overall score" })}</td>
                      {selectedEntries.map((entry) => (
                        <td key={entry.slug} className="px-4 py-3 font-mono">
                          {typeof getOverviewScore(entry) === "number" ? formatExperimentalScore(getOverviewScore(entry), settings.scoreDisplay) : "-"}
                        </td>
                      ))}
                    </tr>
                    {allLanguageKeys.map((languageKey) => (
                      <tr key={languageKey}>
                        <td className="px-4 py-3 font-semibold">
                          {formatShortLanguageLabel(languageKey, selectedEntries.find((entry) => entry.languages[languageKey])?.languages[languageKey]?.label ?? languageKey)}
                        </td>
                        {selectedEntries.map((entry) => (
                          <td key={entry.slug} className="px-4 py-3 font-mono">{getLanguageValue(entry, languageKey)}</td>
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
