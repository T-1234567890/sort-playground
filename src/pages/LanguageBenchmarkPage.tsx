import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import { benchmarkSizes } from "../core/benchmark";
import { formatExperimentalScore, getExperimentalCompositeScore, hasExperimentalBenchmarkData } from "../core/experimentalBenchmark";
import type { BenchmarkSize, ExperimentalLanguageBenchmarkEntry } from "../core/types";

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
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState<BenchmarkSize>("medium");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);

      try {
        const data = await readJson<ExperimentalLanguageBenchmarkEntry[]>("/data/benchmark-languages.json");

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

  const rankedEntries = useMemo(
    () =>
      [...entries]
        .filter((entry) => hasExperimentalBenchmarkData(entry))
        .sort((left, right) => {
          const leftScore = getExperimentalCompositeScore(left, entries, size);
          const rightScore = getExperimentalCompositeScore(right, entries, size);

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
    [entries, size],
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
        </section>

        {loading ? (
          <section className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
            <p className="text-lg font-semibold">{t("labs.section.collectingTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("languageBenchmark.placeholder")}</p>
          </section>
        ) : (
          <section className="mt-8 overflow-hidden rounded-lg border border-zinc-950/10 bg-white/72 shadow-sm dark:border-white/10 dark:bg-white/8">
            {visibleEntries.length ? visibleEntries.map((entry) => {
              const compositeScore = getExperimentalCompositeScore(entry, entries, size);

              return (
                <a
                  key={entry.slug}
                  data-route
                  href={`/labs/benchmark/languages/${entry.slug}`}
                  className="flex items-center justify-between gap-4 border-b border-zinc-950/8 px-5 py-4 transition hover:bg-amber-50/40 dark:border-white/10 dark:hover:bg-white/5 last:border-b-0"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
                      #{rankMap.get(entry.slug) ?? "-"}
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold tracking-tight">{entry.name}</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                      {t("languageBenchmark.compositeScore")}
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold">
                      {typeof compositeScore === "number"
                        ? formatExperimentalScore(compositeScore)
                        : t("languageBenchmark.notBenchmarked")}
                    </p>
                  </div>
                </a>
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
