import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, BookOpen, GitPullRequestArrow, MessagesSquare } from "lucide-react";
import { AlgorithmCard } from "../components/AlgorithmCard";
import { GitHubMark } from "../components/BrandIcons";
import { Footer } from "../components/Footer";
import { HeroPreview } from "../components/HeroPreview";
import { Shell } from "../components/Shell";
import type { Algorithm } from "../core/types";

type HomePageProps = {
  algorithms: Algorithm[];
  dark: boolean;
  onToggleDark: () => void;
};

export function HomePage({ algorithms, dark, onToggleDark }: HomePageProps) {
  const { t } = useTranslation();
  const newestAlgorithms = useMemo(
    () => [...algorithms].sort((a, b) => (b.added ?? "").localeCompare(a.added ?? "") || a.name.localeCompare(b.name)).slice(0, 6),
    [algorithms],
  );
  const communityEntries = [
    {
      title: t("community.contribute.title"),
      description: t("community.contribute.description"),
      href: "/contribute",
      icon: GitPullRequestArrow,
      route: true,
    },
    {
      title: t("community.docs.title"),
      description: t("community.docs.description"),
      href: "https://github.com/T-1234567890/sort-playground/tree/main/docs",
      icon: BookOpen,
    },
    {
      title: t("community.discussions.title"),
      description: t("community.discussions.description"),
      href: "https://github.com/T-1234567890/sort-playground/discussions",
      icon: MessagesSquare,
    },
  ];

  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main>
        <section className="relative overflow-hidden border-b border-zinc-950/10 dark:border-white/10">
          <div className="absolute inset-0 opacity-80 dark:opacity-40">
            <div className="h-full w-full bg-[linear-gradient(120deg,rgba(20,184,166,0.14),transparent_36%),linear-gradient(240deg,rgba(244,63,94,0.1),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0),rgba(20,184,166,0.06))]" />
          </div>
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[minmax(0,1fr)_440px]">
            <div className="animate-rise-in">
              <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">{t("hero.eyebrow")}</p>
              <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight sm:text-7xl">{t("hero.title")}</h1>
              <p className="mt-5 text-2xl font-semibold tracking-tight text-zinc-700 dark:text-zinc-200">
                {t("hero.subtitle")}
              </p>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
                {t("hero.description")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  data-route
                  href="/allalgo"
                  className="rounded-lg bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950"
                >
                  {t("hero.explore")}
                </a>
                <a
                  href="https://github.com/T-1234567890/sort-playground"
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15"
                >
                  <GitHubMark className="h-4 w-4" />
                  {t("hero.github")}
                </a>
              </div>
            </div>
            <HeroPreview algorithms={algorithms} />
          </div>
        </section>

        <section id="algorithms" className="mx-auto max-w-6xl px-5 py-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">{t("homeAlgorithms.eyebrow")}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">{t("homeAlgorithms.title")}</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {t("homeAlgorithms.description")}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newestAlgorithms.map((algorithm) => (
              <AlgorithmCard key={algorithm.slug} algorithm={algorithm} />
            ))}
          </div>

          <div className="mt-8">
            <a
              data-route
              href="/allalgo"
              className="flex w-full items-center justify-center rounded-lg bg-zinc-950 px-5 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950"
            >
              {t("explorer.continue")}
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="flex flex-col justify-between gap-4 border-t border-zinc-950/10 pt-12 dark:border-white/10 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">{t("community.eyebrow")}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">{t("community.title")}</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {t("community.description")}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {communityEntries.map((entry) => {
              const Icon = entry.icon;

              return (
                <a
                  key={entry.href}
                  data-route={entry.route ? true : undefined}
                  href={entry.href}
                  className="group flex min-h-48 flex-col rounded-lg border border-zinc-950/10 bg-white/74 p-5 shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-soft dark:border-white/10 dark:bg-white/8"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                      <Icon size={19} />
                    </span>
                    <ArrowUpRight className="text-zinc-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-teal-600" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight">{entry.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{entry.description}</p>
                </a>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
