import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
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

export function BenchmarkDetailPage({ slug, dark, onToggleDark }: BenchmarkDetailPageProps) {
  const { t } = useTranslation();
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

  const entry = useMemo(() => entries.find((item) => item.slug === slug), [entries, slug]);
  const languageLabels: BenchmarkLanguage[] = ["python", "rust", "c"];
  const sizeLabels: BenchmarkSize[] = ["small", "medium", "large"];

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
              <h1 className="mt-3 text-5xl font-semibold tracking-tight">{entry.name}</h1>
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
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmarkDetail.summary")}</p>
            </section>

            <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
              <div className="rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">{t("benchmarkDetail.resultsTitle")}</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmarkDetail.resultsDescription")}</p>
                  </div>
                  <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {t("benchmarkDetail.noPoints")}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {languageLabels.map((item) => (
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
                  {sizeLabels.map((item) => (
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

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {sizeLabels.map((item) => (
                    <div key={item} className="rounded-lg bg-zinc-50/90 p-4 dark:bg-zinc-950/30">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{t(`labs.benchmarkSizes.${item}`)}</p>
                      <p className="mt-3 font-mono text-2xl font-semibold">
                        {entry.results?.[language]?.[item]?.toFixed(3) ?? "-"} {entry.unit ?? "ms"}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-lg border border-zinc-950/8 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-zinc-950/20">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{t("benchmarkDetail.selectedRanking")}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {t("benchmarkDetail.selectedRankingDescription", {
                      language: t(`labs.benchmarkLanguages.${language}`),
                      size: t(`labs.benchmarkSizes.${size}`),
                    })}
                  </p>
                  <p className="mt-3 font-mono text-xl font-semibold">
                    {entry.results?.[language]?.[size]?.toFixed(3) ?? "-"} {entry.unit ?? "ms"}
                  </p>
                </div>
              </div>

              <div className="grid gap-5">
                <section className="rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
                  <h2 className="text-xl font-semibold tracking-tight">{t("benchmarkDetail.dataTitle")}</h2>
                  <dl className="mt-4 grid gap-3 text-sm">
                    <div>
                      <dt className="font-semibold">{t("benchmarkDetail.fields.mode")}</dt>
                      <dd className="mt-1 text-zinc-600 dark:text-zinc-300">{entry.mode}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">{t("benchmarkDetail.fields.status")}</dt>
                      <dd className="mt-1 text-zinc-600 dark:text-zinc-300">{entry.status}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">{t("benchmarkDetail.fields.unit")}</dt>
                      <dd className="mt-1 text-zinc-600 dark:text-zinc-300">{entry.unit ?? "-"}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">{t("benchmarkDetail.fields.source")}</dt>
                      <dd className="mt-1 text-zinc-600 dark:text-zinc-300">{entry.metadata?.source ?? "-"}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">{t("benchmarkDetail.fields.reason")}</dt>
                      <dd className="mt-1 text-zinc-600 dark:text-zinc-300">{entry.reason ?? t("benchmarkDetail.none")}</dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
                  <h2 className="text-xl font-semibold tracking-tight">{t("benchmarkDetail.snapshotTitle")}</h2>
                  <dl className="mt-4 grid gap-3 text-sm">
                    <div>
                      <dt className="font-semibold">{t("benchmarkDetail.fields.specVersion")}</dt>
                      <dd className="mt-1 text-zinc-600 dark:text-zinc-300">{entry.snapshot?.environment?.benchmarkSpecVersion ?? t("benchmarkDetail.none")}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">{t("benchmarkDetail.fields.runnerOs")}</dt>
                      <dd className="mt-1 text-zinc-600 dark:text-zinc-300">{entry.snapshot?.environment?.runnerOs ?? t("benchmarkDetail.none")}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">{t("benchmarkDetail.fields.workflowRun")}</dt>
                      <dd className="mt-1 text-zinc-600 dark:text-zinc-300">{entry.snapshot?.environment?.workflowRunId ?? t("benchmarkDetail.none")}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">{t("benchmarkDetail.fields.harness")}</dt>
                      <dd className="mt-1 text-zinc-600 dark:text-zinc-300">{entry.snapshot?.harness?.runCountPolicy ?? t("benchmarkDetail.none")}</dd>
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
