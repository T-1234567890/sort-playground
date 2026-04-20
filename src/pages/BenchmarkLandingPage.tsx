import { ArrowLeft, ArrowRight, ArrowUpRight, Beaker, Cpu, FlaskConical, Gauge } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";

type BenchmarkLandingPageProps = {
  dark: boolean;
  onToggleDark: () => void;
};

const repoUrl = "https://github.com/T-1234567890/sort-playground";

export function BenchmarkLandingPage({ dark, onToggleDark }: BenchmarkLandingPageProps) {
  const { t } = useTranslation();

  const methodologyPoints = [
    t("benchmark.methodology.points.datasets"),
    t("benchmark.methodology.points.sizes"),
    t("benchmark.methodology.points.repeats"),
    t("benchmark.methodology.points.environment"),
  ];

  const scopeIncluded = [
    t("benchmark.scope.included.python"),
    t("benchmark.scope.included.rust"),
    t("benchmark.scope.included.c"),
    t("benchmark.scope.included.deterministic"),
    t("benchmark.scope.included.comparable"),
  ];
  const moreLanguageSupported = [
    t("benchmark.moreLanguages.supported.javascript"),
    t("benchmark.moreLanguages.supported.typescript"),
    t("benchmark.moreLanguages.supported.go"),
    t("benchmark.moreLanguages.supported.java"),
    t("benchmark.moreLanguages.supported.cpp"),
    t("benchmark.moreLanguages.supported.swift"),
    t("benchmark.moreLanguages.supported.kotlin"),
    t("benchmark.moreLanguages.supported.zig"),
    t("benchmark.moreLanguages.supported.ruby"),
  ];

  const scopeExcluded = [
    t("benchmark.scope.excluded.nondeterministic"),
    t("benchmark.scope.excluded.visualOnly"),
    t("benchmark.scope.excluded.noBenchmark"),
  ];

  const notes = [
    t("benchmark.notes.items.approximate"),
    t("benchmark.notes.items.ci"),
    t("benchmark.notes.items.variance"),
  ];

  const links = [
    {
      title: t("benchmark.navigation.primary.title"),
      description: t("benchmark.navigation.primary.description"),
      href: "/labs/benchmark",
      route: true,
      primary: true,
    },
    {
      title: t("benchmark.navigation.secondary.languages.title"),
      description: t("benchmark.navigation.secondary.languages.description"),
      href: "/labs/benchmark/languages",
      route: true,
    },
    {
      title: t("benchmark.navigation.secondary.source.title"),
      description: t("benchmark.navigation.secondary.source.description"),
      href: repoUrl,
      route: false,
    },
    {
      title: t("benchmark.navigation.secondary.docs.title"),
      description: t("benchmark.navigation.secondary.docs.description"),
      href: "/docs",
      route: false,
    },
    {
      title: t("benchmark.navigation.secondary.algorithms.title"),
      description: t("benchmark.navigation.secondary.algorithms.description"),
      href: "/",
      route: true,
    },
  ];

  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main className="px-5 py-8 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <a
            data-route
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:-translate-x-0.5 dark:border-white/10 dark:bg-white/10"
          >
            <ArrowLeft size={16} />
            {t("benchmark.back")}
          </a>
        </div>

        <section className="relative mt-8 overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(20,184,166,0.1),rgba(255,255,255,0.96)_34%,rgba(255,255,255,1)_100%)] px-6 py-16 dark:bg-[linear-gradient(180deg,rgba(20,184,166,0.14),rgba(9,9,11,0.94)_34%,rgba(9,9,11,1)_100%)] sm:px-10 sm:py-20">
          <div className="pointer-events-none absolute -left-28 -top-2 h-64 w-64 rounded-full bg-teal-400/14 blur-3xl dark:bg-teal-300/14" />
          <div className="pointer-events-none absolute -right-24 top-8 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-300/10" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-teal-100/55 to-transparent dark:from-teal-500/10" />
          <div className="pointer-events-none absolute left-12 top-12 grid grid-cols-4 gap-2 opacity-10">
            {Array.from({ length: 12 }).map((_, index) => (
              <span key={index} className="h-1.5 w-1.5 rounded-full bg-zinc-500 dark:bg-zinc-300" />
            ))}
          </div>
          <div className="pointer-events-none absolute -left-8 top-2 hidden items-center gap-6 opacity-[0.16] lg:flex">
            <div className="-rotate-[16deg] rounded-[2rem] border border-teal-500/20 bg-white/72 p-5 shadow-sm dark:border-teal-300/10 dark:bg-white/5">
              <Cpu className="h-11 w-11 text-teal-700 dark:text-teal-300" />
            </div>
          </div>
          <div className="pointer-events-none absolute left-28 top-32 hidden opacity-[0.14] lg:block">
            <div className="rotate-[11deg] rounded-[2rem] border border-zinc-950/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
              <Gauge className="h-10 w-10 text-zinc-600 dark:text-zinc-300" />
            </div>
          </div>
          <div className="pointer-events-none absolute right-12 top-4 hidden opacity-[0.14] lg:block">
            <div className="rotate-[14deg] rounded-[2rem] border border-zinc-950/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
              <Beaker className="h-10 w-10 text-zinc-600 dark:text-zinc-300" />
            </div>
          </div>
          <div className="pointer-events-none absolute right-0 top-40 hidden opacity-[0.16] lg:block">
            <div className="-rotate-[12deg] rounded-[2rem] border border-sky-500/20 bg-white/72 p-5 shadow-sm dark:border-sky-300/10 dark:bg-white/5">
              <FlaskConical className="h-11 w-11 text-sky-700 dark:text-sky-300" />
            </div>
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
              {t("benchmark.eyebrow")}
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-7xl">
              {t("benchmark.title")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-xl font-medium leading-8 text-zinc-700 dark:text-zinc-200 sm:text-2xl">
              {t("benchmark.subtitle")}
            </p>
            <div className="mx-auto mt-8 max-w-2xl space-y-4 text-base leading-8 text-zinc-600 dark:text-zinc-300 sm:text-lg">
              <p>{t("benchmark.intro.body1")}</p>
              <p>{t("benchmark.intro.body2")}</p>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-16 max-w-4xl space-y-16 sm:space-y-20">
          <section className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              {t("benchmark.methodology.label")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              {t("benchmark.methodology.title")}
            </h2>
            <div className="mt-6 flex items-center justify-center gap-3 text-zinc-400 dark:text-zinc-500">
              <Cpu className="h-4 w-4" />
              <span className="h-px w-10 bg-zinc-200 dark:bg-white/10" />
              <Beaker className="h-4 w-4" />
              <span className="h-px w-10 bg-zinc-200 dark:bg-white/10" />
              <Gauge className="h-4 w-4" />
            </div>
            <ul className="mt-8 space-y-3 text-base leading-7 text-zinc-600 dark:text-zinc-300">
              {methodologyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>

          <section className="grid gap-12 md:grid-cols-2">
            <div className="mx-auto max-w-xl text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                {t("benchmark.scope.label")}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {t("benchmark.scope.title")}
              </h2>
              <p className="mt-5 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmark.scope.description")}</p>
              <ul className="mt-6 space-y-3 text-base leading-7 text-zinc-600 dark:text-zinc-300">
                {scopeIncluded.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mx-auto max-w-xl text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                {t("benchmark.exclusions.label")}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {t("benchmark.exclusions.title")}
              </h2>
              <p className="mt-5 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmark.exclusions.description")}</p>
              <ul className="mt-6 space-y-3 text-base leading-7 text-zinc-600 dark:text-zinc-300">
                {scopeExcluded.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="grid gap-12 md:grid-cols-2">
            <div className="mx-auto max-w-xl text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                {t("benchmark.mainBenchmark.label")}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {t("benchmark.mainBenchmark.title")}
              </h2>
              <p className="mt-5 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmark.mainBenchmark.description")}</p>
              <p className="mt-5 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmark.mainBenchmark.pythonLargeNote")}</p>
              <ul className="mt-6 space-y-3 text-base leading-7 text-zinc-600 dark:text-zinc-300">
                {scopeIncluded.slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mx-auto max-w-xl text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                {t("benchmark.moreLanguages.label")}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {t("benchmark.moreLanguages.title")}
              </h2>
              <p className="mt-5 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmark.moreLanguages.description")}</p>
              <p className="mt-5 text-sm font-medium text-zinc-700 dark:text-zinc-200">{t("benchmark.moreLanguages.hint")}</p>
              <ul className="mt-6 grid gap-3 text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:grid-cols-2">
                {moreLanguageSupported.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              {t("benchmark.navigation.label")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              {t("benchmark.navigation.title")}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {t("benchmark.navigation.description")}
            </p>

            <div className="mt-8 flex flex-col gap-4 text-left">
              {links.map((link) => (
                <a
                  key={link.href}
                  data-route={link.route ? true : undefined}
                  href={link.href}
                  target={!link.route ? "_blank" : undefined}
                  rel={!link.route ? "noreferrer" : undefined}
                  className={`group flex items-center justify-between gap-4 rounded-2xl border border-zinc-950/10 bg-white/70 px-5 py-5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.03] ${
                    link.primary ? "text-zinc-950 dark:text-white" : "text-zinc-700 dark:text-zinc-200"
                  }`}
                >
                  <div className="max-w-2xl">
                    <p className={`font-semibold ${link.primary ? "text-2xl tracking-tight" : "text-lg tracking-tight"}`}>{link.title}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{link.description}</p>
                  </div>
                  {link.primary ? (
                    <ArrowRight className="shrink-0 transition group-hover:translate-x-1" size={20} />
                  ) : (
                    <ArrowUpRight className="shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={18} />
                  )}
                </a>
              ))}
            </div>

            <p className="mt-8 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{t("benchmark.navigation.crosslink")}</p>
          </section>

          <section className="mx-auto max-w-3xl border-t border-zinc-950/10 pt-12 text-center dark:border-white/10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              {t("benchmark.notes.label")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              {t("benchmark.notes.title")}
            </h2>
            <ul className="mt-6 space-y-3 text-base leading-7 text-zinc-600 dark:text-zinc-300">
              {notes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </Shell>
  );
}
