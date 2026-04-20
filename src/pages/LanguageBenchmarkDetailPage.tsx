import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import { benchmarkProfiles, benchmarkSizes, isBenchmarkSizeCanceled } from "../core/benchmark";
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

function formatTableLanguageLabel(languageKey: string, label: string) {
  if (languageKey === "javascript") {
    return "JS";
  }

  if (languageKey === "typescript") {
    return "TS";
  }

  return label;
}

export function LanguageBenchmarkDetailPage({ slug, dark, onToggleDark }: LanguageBenchmarkDetailPageProps) {
  const { t, i18n } = useTranslation();
  const [entries, setEntries] = useState<ExperimentalLanguageBenchmarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState<BenchmarkSize>("medium");
  const [showOnlyAvailableLanguages, setShowOnlyAvailableLanguages] = useState(false);

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
  const languageEntries = useMemo(() => {
    if (!entry) {
      return [];
    }

    const items = Object.entries(entry.languages);

    if (!showOnlyAvailableLanguages) {
      return items;
    }

    return items.filter(([, language]) => language.status === "benchmarked");
  }, [entry, showOnlyAvailableLanguages]);
  const profileGridStyle = useMemo(
    () => ({ gridTemplateColumns: `minmax(0, 1.2fr) repeat(${Math.max(languageEntries.length, 1)}, minmax(0, 1fr))` }),
    [languageEntries.length],
  );

  function getSizeValueLabel(languageKey: string, language: ExperimentalLanguageBenchmarkEntry["languages"][string], sizeKey: BenchmarkSize) {
    if (language.status === "unsupported" || language.status === "missing") {
      return "-";
    }

    if (!language.experimental && (languageKey === "python" || languageKey === "rust" || languageKey === "c") && isBenchmarkSizeCanceled(languageKey, sizeKey)) {
      return t("languageBenchmark.canceled");
    }

    if (language.experimental && isExperimentalSizeCanceled(languageKey, sizeKey)) {
      return t("languageBenchmark.canceled");
    }

    return formatExperimentalMetric(language.results?.[sizeKey], entry?.unit);
  }

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
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowOnlyAvailableLanguages((current) => !current)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    showOnlyAvailableLanguages
                      ? "bg-amber-400 text-zinc-950 hover:bg-amber-300"
                      : "border border-zinc-950/10 bg-white/70 text-zinc-700 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
                  }`}
                >
                  {t("languageBenchmark.showOnlyAvailableLanguages")}
                </button>
              </div>

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
                      <span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${languageBadgeTone(language.experimental)}`}>
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
                          <span className="font-mono font-semibold">{getSizeValueLabel(languageKey, language, sizeKey)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8 rounded-2xl border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
              <h2 className="text-2xl font-semibold tracking-tight">{t("languageBenchmark.profileTitle")}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {t("languageBenchmark.profileDescription", {
                  size: t(`labs.benchmarkSizes.${size}`),
                })}
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t("languageBenchmark.profileColumnsNote")}</p>

              <div className="mt-6 overflow-hidden rounded-lg border border-zinc-950/8 dark:border-white/10">
                <div className="grid gap-3 bg-zinc-950/[0.03] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:bg-white/[0.03] dark:text-zinc-400" style={profileGridStyle}>
                  <span>{t("languageBenchmark.profileHeader")}</span>
                  {languageEntries.map(([languageKey, language]) => (
                    <span key={languageKey}>{formatTableLanguageLabel(languageKey, language.label)}</span>
                  ))}
                </div>
                <div className="divide-y divide-zinc-950/8 dark:divide-white/10">
                  {benchmarkProfiles.map((profile) => (
                    <div key={profile} className="grid gap-3 px-4 py-4 text-sm" style={profileGridStyle}>
                      <div className="font-medium">{t(`benchmark.profiles.${profile}`, { defaultValue: profile })}</div>
                      {languageEntries.map(([languageKey, language]) => (
                        <div key={languageKey} className="font-mono text-xs sm:text-sm">
                          {language.status === "unsupported" || language.status === "missing"
                            ? "-"
                            : (!language.experimental && (languageKey === "python" || languageKey === "rust" || languageKey === "c") && isBenchmarkSizeCanceled(languageKey, size))
                              ? t("languageBenchmark.canceled")
                              : (language.experimental && isExperimentalSizeCanceled(languageKey, size))
                              ? t("languageBenchmark.canceled")
                              : formatExperimentalMetric(language.workloadProfiles?.[profile]?.[size], entry.unit)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              {showOnlyAvailableLanguages && languageEntries.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">{t("languageBenchmark.noAvailableLanguages")}</p>
              ) : null}
            </section>
          </>
        )}
      </main>
      <Footer />
    </Shell>
  );
}
