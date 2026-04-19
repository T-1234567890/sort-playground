import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
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
      <main className="mx-auto max-w-6xl px-5 py-10">
        <a
          data-route
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:-translate-x-0.5 dark:border-white/10 dark:bg-white/10"
        >
          <ArrowLeft size={16} />
          {t("benchmark.back")}
        </a>

        <section className="mt-14 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
            {t("benchmark.eyebrow")}
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">{t("benchmark.title")}</h1>
          <p className="mt-6 max-w-2xl text-2xl font-semibold tracking-tight text-zinc-700 dark:text-zinc-200">
            {t("benchmark.subtitle")}
          </p>
          <div className="mt-8 max-w-2xl space-y-4 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            <p>{t("benchmark.intro.body1")}</p>
            <p>{t("benchmark.intro.body2")}</p>
          </div>
        </section>

        <section className="mt-20 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
            {t("benchmark.methodology.label")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{t("benchmark.methodology.title")}</h2>
          <ul className="mt-6 space-y-3 text-base leading-7 text-zinc-600 dark:text-zinc-300">
            {methodologyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        <section className="mt-20 grid max-w-5xl gap-12 lg:grid-cols-2">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
              {t("benchmark.scope.label")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{t("benchmark.scope.title")}</h2>
            <p className="mt-5 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmark.scope.description")}</p>
            <ul className="mt-6 space-y-3 text-base leading-7 text-zinc-600 dark:text-zinc-300">
              {scopeIncluded.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
              {t("benchmark.exclusions.label")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{t("benchmark.exclusions.title")}</h2>
            <p className="mt-5 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmark.exclusions.description")}</p>
            <ul className="mt-6 space-y-3 text-base leading-7 text-zinc-600 dark:text-zinc-300">
              {scopeExcluded.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-20 max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
            {t("benchmark.navigation.label")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{t("benchmark.navigation.title")}</h2>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("benchmark.navigation.description")}</p>

          <div className="mt-8 flex flex-col gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                data-route={link.route ? true : undefined}
                href={link.href}
                target={!link.route ? "_blank" : undefined}
                rel={!link.route ? "noreferrer" : undefined}
                className={`group flex items-center justify-between gap-4 border-b border-zinc-950/10 py-5 transition last:border-b-0 dark:border-white/10 ${
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

        <section className="mt-20 max-w-3xl border-t border-zinc-950/10 pt-12 dark:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
            {t("benchmark.notes.label")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{t("benchmark.notes.title")}</h2>
          <ul className="mt-6 space-y-3 text-base leading-7 text-zinc-600 dark:text-zinc-300">
            {notes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
