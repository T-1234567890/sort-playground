import { ArrowLeft, CalendarDays, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { FaviconMark } from "../components/BrandIcons";
import { CodeTabs } from "../components/CodeTabs";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import { Visualizer } from "../components/Visualizer";
import type { Algorithm } from "../core/types";

type AlgorithmPageProps = {
  algorithm: Algorithm;
  dark: boolean;
  onToggleDark: () => void;
};

const categoryStyles = {
  classic: "bg-emerald-100 text-emerald-800 dark:bg-emerald-300/15 dark:text-emerald-200",
  weird: "bg-cyan-100 text-cyan-800 dark:bg-cyan-300/15 dark:text-cyan-200",
  meme: "bg-rose-100 text-rose-800 dark:bg-rose-300/15 dark:text-rose-200",
};

type InfoItemProps = {
  title: string;
  children: ReactNode;
};

function InfoItem({ title, children }: InfoItemProps) {
  return (
    <div className="rounded-lg bg-white/70 p-4 shadow-sm ring-1 ring-zinc-950/5 dark:bg-white/8 dark:ring-white/10">
      <dt className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{title}</dt>
      <dd className="mt-2 min-w-0 font-mono text-base font-semibold leading-6 text-zinc-950 dark:text-zinc-50">{children}</dd>
    </div>
  );
}

export function AlgorithmPage({ algorithm, dark, onToggleDark }: AlgorithmPageProps) {
  const { t } = useTranslation();
  const contributors = [...new Set([...(algorithm.contributors ?? [])].filter(Boolean))];
  const addedLabel = algorithm.added
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${algorithm.added}T00:00:00`))
    : null;

  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <a
          data-route
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:-translate-x-0.5 dark:border-white/10 dark:bg-white/10"
        >
          <ArrowLeft size={16} />
          {t("algorithm.back")}
        </a>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">{algorithm.category}</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight">{algorithm.name}</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-300">
              {algorithm.author ? (
                <a
                  href={`https://github.com/${algorithm.author}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-3 py-2 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/12"
                >
                  <Users size={15} />
                  {t("algorithm.createdBy", { name: algorithm.author })}
                </a>
              ) : null}
              {addedLabel ? (
                <span className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/8">
                  <CalendarDays size={15} />
                  {t("algorithm.addedOn", { date: addedLabel })}
                </span>
              ) : null}
            </div>
            {contributors.length ? (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">{t("algorithm.contributors")}</span>
                <div className="flex -space-x-2">
                  <a
                    data-route
                    href="/about"
                    title="About Sort Playground"
                    className="relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-white bg-teal-500 text-zinc-950 transition hover:-translate-y-0.5 dark:border-zinc-950"
                  >
                    <FaviconMark className="h-5 w-5" />
                  </a>
                  {contributors.map((name) => (
                    <a
                      key={name}
                      href={`https://github.com/${name}`}
                      title={`@${name}`}
                      className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border-2 border-white bg-zinc-200 text-xs font-bold text-zinc-700 transition hover:-translate-y-0.5 dark:border-zinc-950 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      <span>{name.slice(0, 2).toUpperCase()}</span>
                      <img
                        src={`https://github.com/${name}.png`}
                        alt={`@${name}`}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
            <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">{algorithm.description}</p>
          </div>
          <div className="rounded-lg bg-white/60 p-4 shadow-soft backdrop-blur-xl ring-1 ring-zinc-950/5 dark:bg-white/8 dark:ring-white/10">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">{t("algorithm.info")}</p>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{t("algorithm.details")}</span>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoItem title={t("algorithm.time")}>{algorithm.complexity}</InfoItem>
              <InfoItem title={t("algorithm.space")}>{algorithm.spaceComplexity ?? "Unknown"}</InfoItem>
              <InfoItem title={t("algorithm.stability")}>{algorithm.stability ?? "Unknown"}</InfoItem>
              <InfoItem title={t("algorithm.category")}>
                <span
                  className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${
                    categoryStyles[algorithm.category]
                  }`}
                >
                  {algorithm.category}
                </span>
              </InfoItem>
            </dl>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-zinc-950/5 p-3 dark:bg-white/10">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{t("algorithm.contributeHint")}</p>
              <a
                data-route
                href="/contribute"
                className="inline-flex shrink-0 justify-center rounded-lg bg-zinc-950 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950"
              >
                {t("algorithm.contribute")}
              </a>
            </div>
          </div>
        </section>

        <div className="mt-10">
          <Visualizer algorithm={algorithm} />
        </div>

        <section className="mt-12">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">{t("code.sectionEyebrow")}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">{t("code.sectionTitle")}</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {t("code.sectionDescription")}
            </p>
          </div>
          <CodeTabs algorithm={algorithm} snippets={algorithm.code} />
        </section>

      </main>
      <Footer />
    </Shell>
  );
}
