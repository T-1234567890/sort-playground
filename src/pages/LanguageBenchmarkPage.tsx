import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import { benchmarkSizes } from "../core/benchmark";
import { formatExperimentalMetric, languageBadgeTone } from "../core/experimentalBenchmark";
import type { BenchmarkSize, ExperimentalLanguageBenchmarkEntry } from "../core/types";

type LanguageBenchmarkPageProps = {
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

export function LanguageBenchmarkPage({ dark, onToggleDark }: LanguageBenchmarkPageProps) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<ExperimentalLanguageBenchmarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState<BenchmarkSize>("medium");

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

  const visibleEntries = useMemo(() => [...entries].sort((left, right) => left.name.localeCompare(right.name)), [entries]);

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
        </section>

        {loading ? (
          <section className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
            <p className="text-lg font-semibold">{t("labs.section.collectingTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("languageBenchmark.placeholder")}</p>
          </section>
        ) : (
          <section className="mt-8 grid gap-5 lg:grid-cols-2">
            {visibleEntries.length ? visibleEntries.map((entry) => {
              const languageEntries = Object.entries(entry.languages);

              return (
                <a
                  key={entry.slug}
                  data-route
                  href={`/labs/benchmark/languages/${entry.slug}`}
                  className="rounded-2xl border border-zinc-950/10 bg-white/72 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-500/30 dark:border-white/10 dark:bg-white/8"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight">{entry.name}</h2>
                      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{entry.slug}</p>
                    </div>
                    <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-300/20 dark:bg-amber-400/10 dark:text-amber-200">
                      {languageEntries.some(([, language]) => language.experimental)
                        ? t("languageBenchmark.experimental")
                        : t("languageBenchmark.mainProvided")}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {languageEntries.map(([languageKey, language]) => (
                      <span key={languageKey} className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${languageBadgeTone(language.experimental)}`}>
                        {language.label}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3">
                    {languageEntries.map(([languageKey, language]) => (
                      <div key={languageKey} className="flex items-center justify-between gap-4 rounded-lg bg-zinc-50/80 px-4 py-3 text-sm dark:bg-zinc-950/25">
                        <div>
                          <p className="font-semibold">{language.label}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {language.status === "unsupported"
                              ? t("languageBenchmark.pendingSupport")
                              : language.status === "missing"
                                ? t("languageBenchmark.missingImplementation")
                              : language.experimental ? t("languageBenchmark.communityProvided") : t("languageBenchmark.mainProvided")}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-semibold">
                            {language.status === "unsupported" || language.status === "missing"
                              ? t("languageBenchmark.notBenchmarked")
                              : formatExperimentalMetric(language.results?.[size], entry.unit)}
                          </span>
                          {language.note ? (
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{language.note}</p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </a>
              );
            }) : (
              <div className="rounded-lg border border-zinc-950/10 bg-white/72 p-6 text-sm text-zinc-500 shadow-sm dark:border-white/10 dark:bg-white/8 dark:text-zinc-400">
                {t("languageBenchmark.empty")}
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </Shell>
  );
}
