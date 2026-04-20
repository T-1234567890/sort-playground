import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import { getCompositeScore } from "../core/benchmark";
import { formatExperimentalScore, getExperimentalOverviewScore, hasExperimentalBenchmarkData } from "../core/experimentalBenchmark";
import type { BenchmarkRankingEntry, ExperimentalLanguageBenchmarkEntry } from "../core/types";

type LanguageBenchmarkPageProps = {
  dark: boolean;
  onToggleDark: () => void;
};

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[\s_-]+/g, "");
}

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  return response.json() as Promise<T>;
}

export function LanguageBenchmarkPage({ dark, onToggleDark }: LanguageBenchmarkPageProps) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<ExperimentalLanguageBenchmarkEntry[]>([]);
  const [mainEntries, setMainEntries] = useState<BenchmarkRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);

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
    () => new Map(mainEntries.map((entry) => [entry.slug, getCompositeScore(entry)])),
    [mainEntries],
  );

  function getOverviewScore(entry: ExperimentalLanguageBenchmarkEntry) {
    const experimentalScore = getExperimentalOverviewScore(entry, entries);

    if (typeof experimentalScore === "number") {
      return experimentalScore;
    }

    const mainScore = mainCompositeBySlug.get(entry.slug);
    return typeof mainScore === "number" ? mainScore : undefined;
  }

  function toggleCompare(slug: string) {
    setCompareSlugs((current) => {
      if (current.includes(slug)) {
        return current.filter((item) => item !== slug);
      }

      if (current.length >= 4) {
        return current;
      }

      return [...current, slug];
    });
  }

  function toggleSelectMode() {
    setSelectMode((current) => {
      if (current) {
        setCompareSlugs([]);
      }

      return !current;
    });
  }

  const rankedEntries = useMemo(
    () =>
      [...entries]
        .filter((entry) => hasExperimentalBenchmarkData(entry))
        .sort((left, right) => {
          const leftScore = getOverviewScore(left);
          const rightScore = getOverviewScore(right);

          if (typeof leftScore === "number" && typeof rightScore === "number") {
            return rightScore - leftScore || left.name.localeCompare(right.name);
          }

          if (typeof leftScore === "number") {
            return -1;
          }

          if (typeof rightScore === "number") {
            return 1;
          }

          return left.name.localeCompare(right.name);
        }),
    [entries, mainCompositeBySlug],
  );
  const rankMap = useMemo(
    () => new Map(rankedEntries.map((entry, index) => [entry.slug, index + 1])),
    [rankedEntries],
  );
  const visibleEntries = useMemo(
    () => {
      const normalizedQuery = normalizeSearchText(query.trim());

      if (!normalizedQuery) {
        return rankedEntries;
      }

      return rankedEntries.filter((entry) =>
        normalizeSearchText(entry.name).includes(normalizedQuery) || normalizeSearchText(entry.slug).includes(normalizedQuery),
      );
    },
    [query, rankedEntries],
  );

  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <a
          data-route
          href="/labs/benchmark"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:-translate-x-0.5 dark:border-white/10 dark:bg-white/10"
        >
          <ArrowLeft size={16} />
          {t("languageBenchmark.back")}
        </a>

        <section className="mt-8 overflow-hidden rounded-[28px] border border-zinc-950/10 bg-[linear-gradient(180deg,rgba(253,230,138,0.2),rgba(255,255,255,0.92))] p-8 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(251,191,36,0.14),rgba(255,255,255,0.05))]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">{t("languageBenchmark.eyebrow")}</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t("languageBenchmark.title")}</h1>
              <p className="mt-4 text-base leading-7 text-zinc-700 dark:text-zinc-200">{t("languageBenchmark.description")}</p>
              <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("languageBenchmark.note")}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("languageBenchmark.largeDatasetNote")}</p>
              <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-200">{t("languageBenchmark.openDetailHint")}</p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                data-route
                href="/labs/benchmark"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950"
              >
                {t("languageBenchmark.mainCta")}
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div className="mt-6 max-w-xl">
            <label htmlFor="language-benchmark-search" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
              {t("labs.search.label")}
            </label>
            <input
              id="language-benchmark-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("languageBenchmark.searchPlaceholder")}
              className="mt-2 w-full rounded-xl border border-zinc-950/10 bg-white/80 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-zinc-500"
            />
          </div>

          <div className="mt-6 rounded-lg border border-zinc-950/10 bg-zinc-50/80 px-4 py-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">{t("languageBenchmarkCompare.selectionTitle", { defaultValue: "Compare language benchmark entries" })}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  {t("languageBenchmarkCompare.selectionDescription", {
                    defaultValue: "Select 2 to 4 algorithms, then open the compare view.",
                  })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={toggleSelectMode}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    selectMode
                      ? "bg-amber-400 text-zinc-950 hover:bg-amber-300"
                      : "border border-zinc-950/10 bg-white text-zinc-700 hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white dark:hover:text-zinc-950"
                  }`}
                >
                  {selectMode
                    ? t("benchmarkCompare.cancel", { defaultValue: "Cancel" })
                    : t("benchmarkCompare.selectMode", { defaultValue: "Select" })}
                </button>
                <a
                  data-route={selectMode && compareSlugs.length >= 2 ? true : undefined}
                  href={`/labs/benchmark/languages/compare?items=${encodeURIComponent(compareSlugs.join(","))}`}
                  className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    selectMode && compareSlugs.length >= 2
                      ? "bg-zinc-950 text-white hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950"
                      : "cursor-not-allowed border border-zinc-950/10 bg-zinc-100 text-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-500"
                  }`}
                >
                  {t("languageBenchmarkCompare.open", {
                    defaultValue: "Compare {{count}} selected",
                    count: compareSlugs.length,
                  })}
                </a>
              </div>
            </div>
            {selectMode ? (
              <div className="mt-4 border-t border-zinc-950/10 pt-4 dark:border-white/10">
                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                  {t("benchmarkCompare.selectedCount", {
                    defaultValue: "{{count}} selected",
                    count: compareSlugs.length,
                  })}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        {loading ? (
          <section className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
            <p className="text-lg font-semibold">{t("labs.section.collectingTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("languageBenchmark.placeholder")}</p>
          </section>
        ) : (
          <section className="mt-8 overflow-hidden rounded-lg border border-zinc-950/10 bg-white/72 shadow-sm dark:border-white/10 dark:bg-white/8">
            {visibleEntries.length ? visibleEntries.map((entry) => {
              const overallScore = getOverviewScore(entry);

              return (
                <div
                  key={entry.slug}
                  onClick={selectMode ? () => toggleCompare(entry.slug) : undefined}
                  role={selectMode ? "button" : undefined}
                  tabIndex={selectMode ? 0 : undefined}
                  onKeyDown={selectMode ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleCompare(entry.slug);
                    }
                  } : undefined}
                  className={`flex items-center justify-between gap-4 border-b border-zinc-950/8 px-5 py-4 transition dark:border-white/10 last:border-b-0 ${
                    selectMode && compareSlugs.includes(entry.slug) ? "bg-amber-50/70 dark:bg-amber-400/10" : ""
                  } ${
                    selectMode
                      ? "cursor-pointer hover:bg-amber-50/50 dark:hover:bg-amber-400/5"
                      : "hover:bg-amber-50/40 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
                      #{rankMap.get(entry.slug) ?? "-"}
                    </span>
                    <div className="min-w-0">
                      {selectMode ? (
                        <button
                          type="button"
                          onClick={() => toggleCompare(entry.slug)}
                          disabled={!compareSlugs.includes(entry.slug) && compareSlugs.length >= 4}
                          className="text-left text-lg font-semibold tracking-tight hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-45 dark:hover:text-amber-300"
                        >
                          {entry.name}
                        </button>
                      ) : (
                        <a data-route href={`/labs/benchmark/languages/${entry.slug}`} className="text-lg font-semibold tracking-tight hover:text-amber-700 dark:hover:text-amber-300">
                          {entry.name}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {selectMode ? (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          compareSlugs.includes(entry.slug)
                            ? "bg-amber-400 text-zinc-950"
                            : "bg-zinc-950/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
                        }`}
                      >
                        {compareSlugs.includes(entry.slug)
                          ? t("benchmarkCompare.selected", { defaultValue: "Selected" })
                          : t("benchmarkCompare.tapToSelect", { defaultValue: "Tap to select" })}
                      </span>
                    ) : null}
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                        {t("languageBenchmark.overallScore", { defaultValue: "Overall score" })}
                      </p>
                      <p className="mt-1 font-mono text-lg font-semibold">
                        {typeof overallScore === "number"
                          ? formatExperimentalScore(overallScore)
                          : t("languageBenchmark.notBenchmarked")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="p-6 text-sm text-zinc-500 dark:text-zinc-400">
                {query.trim() ? t("labs.search.noAlgorithms") : t("languageBenchmark.empty")}
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </Shell>
  );
}
