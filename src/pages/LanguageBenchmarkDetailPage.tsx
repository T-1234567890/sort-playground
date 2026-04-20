import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import { benchmarkProfiles, benchmarkSizes } from "../core/benchmark";
import { formatExperimentalMetric, hasExperimentalBenchmarkData, isExperimentalSizeCanceled, languageBadgeTone } from "../core/experimentalBenchmark";
import type { BenchmarkSize, ExperimentalLanguageBenchmarkEntry } from "../core/types";

type LanguageBenchmarkDetailPageProps = {
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

export function LanguageBenchmarkDetailPage({ slug, dark, onToggleDark }: LanguageBenchmarkDetailPageProps) {
  const { t, i18n } = useTranslation();
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

  const entry = useMemo(
    () => entries.find((item) => item.slug === slug && hasExperimentalBenchmarkData(item)),
    [entries, slug],
  );
  const languageEntries = useMemo(() => (entry ? Object.entries(entry.languages) : []), [entry]);
  const profileGridStyle = useMemo(
    () => ({ gridTemplateColumns: `minmax(0, 1.2fr) repeat(${Math.max(languageEntries.length, 1)}, minmax(0, 1fr))` }),
    [languageEntries.length],
  );

  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <a
          data-route
          href="/labs/benchmark/languages"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:-translate-x-0.5 dark:border-white/10 dark:bg-white/10"
        >
          <ArrowLeft size={16} />
          {t("languageBenchmark.detailBack")}
        </a>

        {loading ? (
          <section className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
            <p className="text-lg font-semibold">{t("labs.section.collectingTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("languageBenchmark.placeholder")}</p>
          </section>
        ) : !entry ? (
          <section className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
            <p className="text-lg font-semibold">{t("languageBenchmark.missingTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("languageBenchmark.empty")}</p>
          </section>
        ) : (
          <>
            <section className="mt-8 overflow-hidden rounded-[28px] border border-zinc-950/10 bg-[linear-gradient(180deg,rgba(253,230,138,0.18),rgba(255,255,255,0.92))] p-8 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(251,191,36,0.14),rgba(255,255,255,0.05))]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">{t("languageBenchmark.eyebrow")}</p>
              <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{entry.name}</h1>
                  <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("languageBenchmark.detailDescription")}</p>
                  <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {t("languageBenchmark.lastUpdated")}: {formatDateTime(entry.metadata?.lastUpdatedAt, i18n.language)}
                  </p>
                </div>
                <a
                  data-route
                  href={`/labs/benchmark/${entry.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950"
                >
                  {t("languageBenchmark.viewMain")}
                  <ArrowRight size={16} />
                </a>
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

            <section className="mt-8 rounded-2xl border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
              <h2 className="text-2xl font-semibold tracking-tight">{t("languageBenchmark.languageOverview")}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("languageBenchmark.languageOverviewDescription")}</p>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {languageEntries.map(([languageKey, language]) => (
                  <div key={languageKey} className="rounded-xl border border-zinc-950/10 bg-zinc-50/85 p-5 dark:border-white/10 dark:bg-zinc-950/25">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold">{language.label}</h3>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{language.runtime ?? t("languageBenchmark.mainProvided")}</p>
                        {language.note ? (
                          <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{language.note}</p>
                        ) : null}
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${languageBadgeTone(language.experimental)}`}>
                        {language.status === "unsupported"
                          ? t("languageBenchmark.pendingSupport")
                          : language.status === "missing"
                            ? t("languageBenchmark.missingImplementation")
                          : language.experimental ? t("languageBenchmark.communityProvided") : t("languageBenchmark.mainProvided")}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-2 text-sm">
                      {benchmarkSizes.map((sizeKey) => (
                        <div key={sizeKey} className="flex items-center justify-between gap-4">
                          <span className="text-zinc-500 dark:text-zinc-400">{t(`labs.benchmarkSizes.${sizeKey}`)}</span>
                          <span className="font-mono font-semibold">
                            {language.status === "unsupported" || language.status === "missing"
                              ? t("languageBenchmark.notBenchmarked")
                              : isExperimentalSizeCanceled(languageKey, sizeKey)
                                ? t("languageBenchmark.canceled")
                                : formatExperimentalMetric(language.results?.[sizeKey], entry.unit)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8 rounded-2xl border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
              <h2 className="text-2xl font-semibold tracking-tight">{t("languageBenchmark.profileTitle")}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("languageBenchmark.profileDescription")}</p>

              <div className="mt-6 overflow-hidden rounded-lg border border-zinc-950/8 dark:border-white/10">
                <div className="grid gap-3 bg-zinc-950/[0.03] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:bg-white/[0.03] dark:text-zinc-400" style={profileGridStyle}>
                  <span>{t("languageBenchmark.profileHeader")}</span>
                  {languageEntries.map(([languageKey, language]) => (
                    <span key={languageKey}>{language.label}</span>
                  ))}
                </div>
                <div className="divide-y divide-zinc-950/8 dark:divide-white/10">
                  {benchmarkProfiles.map((profile) => (
                    <div key={profile} className="grid gap-3 px-4 py-4 text-sm" style={profileGridStyle}>
                      <div className="font-medium">{t(`benchmark.profiles.${profile}`, { defaultValue: profile })}</div>
                      {languageEntries.map(([languageKey, language]) => (
                        <div key={languageKey} className="font-mono text-xs sm:text-sm">
                          {language.status === "unsupported" || language.status === "missing"
                            ? t("languageBenchmark.notBenchmarked")
                            : isExperimentalSizeCanceled(languageKey, size)
                              ? t("languageBenchmark.canceled")
                              : formatExperimentalMetric(language.workloadProfiles?.[profile]?.[size], entry.unit)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </Shell>
  );
}
