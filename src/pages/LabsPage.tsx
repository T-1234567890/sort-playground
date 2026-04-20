import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, FileText, FlaskConical, Gauge, GitPullRequest, MessageSquare, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import {
  benchmarkProfiles,
  formatBenchmarkMetric,
  getBenchmarkProfileMetric,
  getBenchmarkProfileStatus,
  getCompositeScore,
  getSizeScore,
  isBenchmarkSizeCanceled,
} from "../core/benchmark";
import type { BenchmarkLanguage, BenchmarkRankingEntry, BenchmarkSize, BenchmarkWorkloadProfile, CommunityRankingEntry, SortLabsEvent } from "../core/types";
import events from "../data/events.json";

type LabsPageProps = {
  dark: boolean;
  onToggleDark: () => void;
};

type LabsSection = "overview" | "community" | "benchmark" | "events";

type ResourceLink = {
  title: string;
  description: string;
  href: string;
  icon?: typeof BookOpen;
  external?: boolean;
};

const REPO_BASE = "https://github.com/T-1234567890/sort-playground";

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[\s_-]+/g, "");
}

function currentSection(): LabsSection {
  const slug = window.location.pathname.replace(/^\/labs\/?/, "").split("/")[0];

  if (slug === "community" || slug === "benchmark" || slug === "events") {
    return slug;
  }

  return "overview";
}

function formatDate(date?: string) {
  if (!date) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  return response.json() as Promise<T>;
}

function ResourceList({
  title,
  description,
  links,
  showIcons = true,
  showHeader = true,
}: {
  title: string;
  description: string;
  links: ResourceLink[];
  showIcons?: boolean;
  showHeader?: boolean;
}) {
  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
      {showHeader ? (
        <div className="max-w-2xl">
          <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p>
        </div>
      ) : null}

      <div className={`${showHeader ? "mt-6" : ""} grid gap-3`}>
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className="group flex items-start justify-between gap-4 rounded-lg border border-zinc-950/8 bg-zinc-50/90 px-4 py-4 transition hover:border-teal-500/35 hover:bg-white dark:border-white/10 dark:bg-zinc-950/20 dark:hover:bg-white/10"
            >
              <div className={`flex items-start ${showIcons && Icon ? "gap-3" : ""}`}>
                {showIcons && Icon ? (
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                    <Icon size={16} />
                  </span>
                ) : null}
                <div>
                  <p className="font-semibold">{link.title}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{link.description}</p>
                </div>
              </div>
              <ArrowUpRight className="mt-1 shrink-0 text-zinc-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-300" size={16} />
            </a>
          );
        })}
      </div>
    </div>
  );
}

function PlaceholderRanking({
  title,
  description,
  loadingTitle,
  loadingBody,
  trailingLabel,
}: {
  title: string;
  description: string;
  loadingTitle: string;
  loadingBody: string;
  trailingLabel: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="max-w-3xl">
        <h3 className="text-3xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p>
      </div>

      <div className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
        <div className="flex items-start gap-4">
          <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-300 border-t-teal-500 animate-spin dark:border-zinc-700 dark:border-t-teal-300" />
          <div>
            <p className="text-lg font-semibold">{loadingTitle}</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">{loadingBody}</p>
          </div>
        </div>

        <ol className="mt-8 divide-y divide-zinc-950/8 dark:divide-white/10">
          {[1, 2, 3, 4, 5].map((rank) => (
            <li key={rank} className="flex items-center gap-4 py-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
                #{rank}
              </span>
              <div className="flex-1">
                <div className="h-3 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="mt-2 h-3 w-64 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
              <div className="hidden w-28 sm:block">
                <div className="h-3 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </li>
          ))}
          <li className="flex items-center gap-4 py-4">
            <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-dashed border-zinc-950/15 px-2 text-xs font-semibold text-zinc-500 dark:border-white/15 dark:text-zinc-400">
              ...
            </span>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{trailingLabel}</p>
          </li>
        </ol>
      </div>
    </section>
  );
}

function SectionDocButton({ link }: { link: ResourceLink }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20">
      <a
        href={link.href}
        target={link.external ? "_blank" : undefined}
        rel={link.external ? "noreferrer" : undefined}
        className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950"
      >
        {link.title}
        <ArrowUpRight size={16} />
      </a>
    </section>
  );
}

export function LabsPage({ dark, onToggleDark }: LabsPageProps) {
  const { t } = useTranslation();
  const section = currentSection();
  const allEvents = events as SortLabsEvent[];
  const activeEvent = allEvents.find((event) => event.status === "active") ?? allEvents[0];
  const [algorithmQuery, setAlgorithmQuery] = useState("");
  const [communityEntries, setCommunityEntries] = useState<CommunityRankingEntry[]>([]);
  const [communityLoading, setCommunityLoading] = useState(true);
  const [eventEntries, setEventEntries] = useState<CommunityRankingEntry[]>([]);
  const [eventLoading, setEventLoading] = useState(true);
  const [benchmarkEntries, setBenchmarkEntries] = useState<BenchmarkRankingEntry[]>([]);
  const [benchmarkLoading, setBenchmarkLoading] = useState(true);
  const [benchmarkLanguage, setBenchmarkLanguage] = useState<BenchmarkLanguage>("python");
  const [benchmarkSize, setBenchmarkSize] = useState<BenchmarkSize>("medium");
  const [benchmarkProfile, setBenchmarkProfile] = useState<BenchmarkWorkloadProfile>("random-uniform");
  const [benchmarkCompareSlugs, setBenchmarkCompareSlugs] = useState<string[]>([]);
  const [benchmarkSelectMode, setBenchmarkSelectMode] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setBenchmarkLoading(true);
      setCommunityLoading(true);
      setEventLoading(true);
      const [benchmarkResult, communityResult, eventResult] = await Promise.allSettled([
        readJson<BenchmarkRankingEntry[]>("/data/benchmark-ranking.json"),
        readJson<CommunityRankingEntry[]>("/data/community-ranking.json"),
        readJson<CommunityRankingEntry[]>("/data/event-ranking.json"),
      ]);

      if (cancelled) {
        return;
      }

      setBenchmarkEntries(benchmarkResult.status === "fulfilled" ? benchmarkResult.value : []);
      setCommunityEntries(communityResult.status === "fulfilled" ? communityResult.value : []);
      setEventEntries(eventResult.status === "fulfilled" ? eventResult.value : []);
      setBenchmarkLoading(false);
      setCommunityLoading(false);
      setEventLoading(false);
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [activeEvent.id]);

  const featureBlocks = [
    {
      title: t("labs.blocks.community.title"),
      description: t("labs.blocks.community.description"),
      href: "/labs/community",
      cta: t("labs.blocks.community.cta"),
      icon: Trophy,
    },
    {
      title: t("labs.blocks.benchmark.title"),
      description: t("labs.blocks.benchmark.description"),
      href: "/labs/benchmark",
      cta: t("labs.blocks.benchmark.cta"),
      icon: Gauge,
    },
    {
      title: t("labs.blocks.events.title"),
      description: t("labs.blocks.events.description"),
      href: "/labs/events",
      cta: t("labs.blocks.events.cta"),
      icon: FlaskConical,
    },
  ] as const;

  const navItems = [
    { id: "overview", label: t("labs.nav.overview"), href: "/labs" },
    { id: "community", label: t("labs.nav.community"), href: "/labs/community" },
    { id: "benchmark", label: t("labs.nav.benchmark"), href: "/labs/benchmark" },
    { id: "events", label: t("labs.nav.events"), href: "/labs/events" },
  ] as const;

  const docsLinks: ResourceLink[] = [
    {
      title: t("labs.guides.join.title"),
      description: t("labs.guides.join.description"),
      href: `${REPO_BASE}/blob/main/docs/labs-how-to-join.md`,
      external: true,
    },
    {
      title: t("labs.guides.howItWorks.title"),
      description: t("labs.guides.howItWorks.description"),
      href: `${REPO_BASE}/blob/main/docs/labs-how-it-works.md`,
      external: true,
    },
    {
      title: t("labs.guides.specialCases.title"),
      description: t("labs.guides.specialCases.description"),
      href: `${REPO_BASE}/blob/main/docs/labs-special-cases.md`,
      external: true,
    },
  ];

  const communityDocsLinks: ResourceLink[] = [
    {
      title: t("labs.guides.community.title"),
      description: t("labs.guides.community.description"),
      href: `${REPO_BASE}/blob/main/docs/community-ranking.md`,
      external: true,
    },
  ];

  const benchmarkDocsLinks: ResourceLink[] = [
    {
      title: t("labs.guides.benchmark.title"),
      description: t("labs.guides.benchmark.description"),
      href: `${REPO_BASE}/blob/main/docs/benchmark.md`,
      external: true,
    },
  ];

  const eventsDocsLinks: ResourceLink[] = [
    {
      title: t("labs.guides.events.title"),
      description: t("labs.guides.events.description"),
      href: `${REPO_BASE}/blob/main/docs/events.md`,
      external: true,
    },
  ];

  const githubLinks: ResourceLink[] = [
    {
      title: t("labs.github.contributing.title"),
      description: t("labs.github.contributing.description"),
      href: `${REPO_BASE}/blob/main/CONTRIBUTING.md`,
      icon: GitPullRequest,
      external: true,
    },
    {
      title: t("labs.github.algorithmIssue.title"),
      description: t("labs.github.algorithmIssue.description"),
      href: `${REPO_BASE}/issues/new?template=new_algorithm.yml`,
      icon: GitPullRequest,
      external: true,
    },
    {
      title: t("labs.github.discussions.title"),
      description: t("labs.github.discussions.description"),
      href: `${REPO_BASE}/discussions`,
      icon: MessageSquare,
      external: true,
    },
    {
      title: t("labs.github.roadmap.title"),
      description: t("labs.github.roadmap.description"),
      href: `${REPO_BASE}/blob/main/docs/roadmap.md`,
      icon: BookOpen,
      external: true,
    },
  ];

  const normalizedAlgorithmQuery = normalizeSearchText(algorithmQuery.trim());
  const hasAlgorithmQuery = normalizedAlgorithmQuery.length > 0;
  const filteredCommunityEntries = communityEntries.filter((entry) =>
    normalizeSearchText(`${entry.name} ${entry.slug} ${entry.category} ${entry.author}`).includes(normalizedAlgorithmQuery),
  );
  const filteredEventEntries = eventEntries.filter((entry) =>
    normalizeSearchText(`${entry.name} ${entry.slug} ${entry.category} ${entry.author} ${entry.event ?? ""}`).includes(normalizedAlgorithmQuery),
  );
  const filteredBenchmarkEntries = benchmarkEntries.filter((entry) =>
    normalizeSearchText(`${entry.name} ${entry.slug} ${entry.reason ?? ""} ${entry.complexity ?? ""}`).includes(normalizedAlgorithmQuery),
  );
  const communityRankMap = useMemo(
    () => new Map(communityEntries.map((entry, index) => [`${entry.slug}-${entry.category}`, index + 1])),
    [communityEntries],
  );
  const eventRankMap = useMemo(
    () => new Map(eventEntries.map((entry, index) => [`${entry.slug}-${entry.category}`, index + 1])),
    [eventEntries],
  );

  function toggleBenchmarkCompare(slug: string) {
    setBenchmarkCompareSlugs((current) => {
      if (current.includes(slug)) {
        return current.filter((item) => item !== slug);
      }

      if (current.length >= 4) {
        return current;
      }

      return [...current, slug];
    });
  }

  function toggleBenchmarkSelectMode() {
    setBenchmarkSelectMode((current) => {
      if (current) {
        setBenchmarkCompareSlugs([]);
      }

      return !current;
    });
  }

  function renderOverview() {
    return (
      <>
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid auto-rows-fr gap-5 lg:grid-cols-3">
            {featureBlocks.map((block) => {
              const Icon = block.icon;

              return (
                <a
                  key={block.href}
                  data-route
                  href={block.href}
                  className="group flex min-h-60 flex-col justify-between rounded-lg border border-zinc-950/10 bg-white/60 p-6 transition hover:-translate-y-0.5 hover:border-teal-500/35 hover:bg-white/85 dark:border-white/10 dark:bg-white/6 dark:hover:bg-white/10"
                >
                  <div>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                      <Icon size={18} />
                    </span>
                    <h2 className="mt-5 text-2xl font-semibold tracking-tight">{block.title}</h2>
                    <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{block.description}</p>
                  </div>
                  <div className="mt-8 inline-flex items-center justify-between text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    <span>{block.cta}</span>
                    <ArrowUpRight className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-teal-600" size={16} />
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="rounded-lg bg-zinc-950/[0.03] px-6 py-8 dark:bg-white/[0.04]">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">{t("labs.philosophy.eyebrow")}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">{t("labs.philosophy.title")}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("labs.philosophy.description")}</p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {["motion", "context", "play"].map((key) => (
                <div key={key} className="rounded-lg border border-zinc-950/8 bg-white/60 px-4 py-4 dark:border-white/10 dark:bg-white/6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{t(`labs.philosophy.${key}.title`)}</p>
                  <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(`labs.philosophy.${key}.description`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 lg:grid-cols-2">
          <ResourceList title={t("labs.resources.docsTitle")} description={t("labs.resources.docsDescription")} links={docsLinks} showIcons={false} showHeader={false} />
          <ResourceList title={t("labs.resources.githubTitle")} description={t("labs.resources.githubDescription")} links={githubLinks} showIcons={false} showHeader={false} />
        </section>
      </>
    );
  }

  function renderCommunity() {
    const communityDoc = communityDocsLinks[0];
    const visibleEntries = hasAlgorithmQuery ? filteredCommunityEntries : communityEntries;

    return (
      <>
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="max-w-3xl">
            <h3 className="text-3xl font-semibold tracking-tight">{t("labs.blocks.community.title")}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("labs.section.communityDescription")}</p>
          </div>

          {communityLoading ? (
            <div className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
              <div className="flex items-start gap-4">
                <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-300 border-t-teal-500 animate-spin dark:border-zinc-700 dark:border-t-teal-300" />
                <div>
                  <p className="text-lg font-semibold">{t("labs.section.collectingTitle")}</p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("labs.section.communityPlaceholder")}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 overflow-hidden rounded-lg border border-zinc-950/10 bg-white/72 shadow-sm dark:border-white/10 dark:bg-white/8">
              {visibleEntries.length ? (
                <ol className="divide-y divide-zinc-950/8 dark:divide-white/10">
                  {visibleEntries.map((entry) => (
                    <li key={`${entry.slug}-${entry.category}`} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
                          #{communityRankMap.get(`${entry.slug}-${entry.category}`) ?? "-"}
                        </span>
                        <div>
                          <a data-route href={`/algo/${entry.slug}`} className="text-lg font-semibold hover:text-teal-600 dark:hover:text-teal-300">
                            {entry.name}
                          </a>
                          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{entry.category}</p>
                        </div>
                      </div>
                      <div className="grid gap-1 text-sm sm:text-right">
                        <p className="font-mono font-semibold">{entry.score}</p>
                        <p className="text-zinc-500 dark:text-zinc-400">{entry.author}</p>
                      </div>
                    </li>
                  ))}
                  <li className="flex items-center gap-4 px-5 py-4">
                    <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-dashed border-zinc-950/15 px-2 text-xs font-semibold text-zinc-500 dark:border-white/15 dark:text-zinc-400">
                      ...
                    </span>
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{t("labs.section.moreComing")}</p>
                  </li>
                </ol>
              ) : (
                <div className="px-5 py-6 text-sm text-zinc-500 dark:text-zinc-400">
                  {hasAlgorithmQuery ? t("labs.search.noAlgorithms") : t("labs.section.communityPlaceholder")}
                </div>
              )}
            </div>
          )}
        </section>
        {communityDoc ? <SectionDocButton link={communityDoc} /> : null}
      </>
    );
  }

  function renderBenchmark() {
    const benchmarkDoc = benchmarkDocsLinks[0];
    const sourceEntries = hasAlgorithmQuery ? filteredBenchmarkEntries : benchmarkEntries;
    const languageLabels: BenchmarkLanguage[] = ["python", "rust", "c"];
    const sizeLabels: BenchmarkSize[] = ["small", "medium", "large"];
    const profileLabels: BenchmarkWorkloadProfile[] = benchmarkProfiles;
    const fullSortedEntries = [...benchmarkEntries]
      .filter((entry) =>
        entry.mode === "automated" &&
        entry.status === "benchmarked" &&
        typeof getBenchmarkProfileMetric(entry, benchmarkProfile, benchmarkLanguage, benchmarkSize) === "number",
      )
      .sort(
        (left, right) =>
          (getBenchmarkProfileMetric(left, benchmarkProfile, benchmarkLanguage, benchmarkSize) ?? Number.POSITIVE_INFINITY) -
            (getBenchmarkProfileMetric(right, benchmarkProfile, benchmarkLanguage, benchmarkSize) ?? Number.POSITIVE_INFINITY) ||
          left.name.localeCompare(right.name),
      );
    const benchmarkRankMap = new Map(fullSortedEntries.map((entry, index) => [entry.slug, index + 1]));
    const sortedEntries = [...sourceEntries]
      .filter((entry) =>
        entry.mode === "automated" &&
        entry.status === "benchmarked" &&
        typeof getBenchmarkProfileMetric(entry, benchmarkProfile, benchmarkLanguage, benchmarkSize) === "number",
      )
      .sort(
        (left, right) =>
          (getBenchmarkProfileMetric(left, benchmarkProfile, benchmarkLanguage, benchmarkSize) ?? Number.POSITIVE_INFINITY) -
            (getBenchmarkProfileMetric(right, benchmarkProfile, benchmarkLanguage, benchmarkSize) ?? Number.POSITIVE_INFINITY) ||
          left.name.localeCompare(right.name),
      );

    return (
      <>
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="max-w-3xl">
            <h3 className="text-3xl font-semibold tracking-tight">{t("labs.blocks.benchmark.title")}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("labs.section.benchmarkDescription")}</p>
            <p className="mt-4 text-sm font-medium text-zinc-700 dark:text-zinc-200">{t("labs.section.benchmarkEnvironment")}</p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t("labs.section.benchmarkAverageNote")}</p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {t("labs.section.benchmarkProfileNote", { profile: t(`benchmark.profiles.${benchmarkProfile}`) })}
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {t("labs.section.benchmarkSelectionNote", {
                language: t(`labs.benchmarkLanguages.${benchmarkLanguage}`),
                size: t(`labs.benchmarkSizes.${benchmarkSize}`),
                profile: t(`benchmark.profiles.${benchmarkProfile}`),
              })}
            </p>
            {benchmarkProfile !== "random-uniform" ? (
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t("labs.section.profileTimingOnly")}</p>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {languageLabels.map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => {
                  setBenchmarkLanguage(language);
                  if (language === "python" && benchmarkSize === "large") {
                    setBenchmarkSize("medium");
                  }
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  benchmarkLanguage === language
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                    : "border border-zinc-950/10 bg-white/70 text-zinc-700 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
                }`}
              >
                {t(`labs.benchmarkLanguages.${language}`)}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {sizeLabels.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setBenchmarkSize(size)}
                disabled={isBenchmarkSizeCanceled(benchmarkLanguage, size)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  benchmarkSize === size
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                    : isBenchmarkSizeCanceled(benchmarkLanguage, size)
                      ? "cursor-not-allowed border border-zinc-950/10 bg-zinc-100 text-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-500"
                      : "border border-zinc-950/10 bg-white/70 text-zinc-700 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
                }`}
              >
                {t(`labs.benchmarkSizes.${size}`)}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {profileLabels.map((profile) => (
              <button
                key={profile}
                type="button"
                onClick={() => setBenchmarkProfile(profile)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  benchmarkProfile === profile
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                    : "border border-zinc-950/10 bg-white/70 text-zinc-700 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
                }`}
              >
                {t(`benchmark.profiles.${profile}`)}
              </button>
            ))}
          </div>

          {benchmarkLanguage === "python" ? (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{t("labs.section.pythonLargeCanceled")}</p>
          ) : null}
          <div className="mt-5 rounded-lg border border-zinc-950/10 bg-zinc-50/80 px-4 py-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">{t("benchmarkCompare.selectionTitle", { defaultValue: "Compare benchmark entries" })}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  {t("benchmarkCompare.selectionDescription", {
                    defaultValue: "Select 2 to 4 algorithms, then open the compare view.",
                  })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={toggleBenchmarkSelectMode}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    benchmarkSelectMode
                      ? "bg-teal-500 text-zinc-950 hover:bg-teal-400"
                      : "border border-zinc-950/10 bg-white text-zinc-700 hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white dark:hover:text-zinc-950"
                  }`}
                >
                  {benchmarkSelectMode
                    ? t("benchmarkCompare.cancel", { defaultValue: "Cancel" })
                    : t("benchmarkCompare.selectMode", { defaultValue: "Select" })}
                </button>
                <a
                  data-route={benchmarkSelectMode && benchmarkCompareSlugs.length >= 2 ? true : undefined}
                  href={`/labs/benchmark/compare?items=${encodeURIComponent(benchmarkCompareSlugs.join(","))}`}
                  className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    benchmarkSelectMode && benchmarkCompareSlugs.length >= 2
                      ? "bg-zinc-950 text-white hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950"
                      : "cursor-not-allowed border border-zinc-950/10 bg-zinc-100 text-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-500"
                  }`}
                >
                  {t("benchmarkCompare.open", {
                    defaultValue: "Compare {{count}} selected",
                    count: benchmarkCompareSlugs.length,
                  })}
                </a>
              </div>
            </div>
            {benchmarkSelectMode ? (
              <div className="mt-4 border-t border-zinc-950/10 pt-4 dark:border-white/10">
                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                  {t("benchmarkCompare.selectedCount", {
                    defaultValue: "{{count}} selected",
                    count: benchmarkCompareSlugs.length,
                  })}
                </p>
              </div>
            ) : null}
          </div>
          <div className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-zinc-700 dark:border-amber-300/15 dark:bg-amber-400/10 dark:text-zinc-200">
            <p className="font-semibold">{t("labs.section.languageBenchmarkTitle")}</p>
            <p className="mt-1 text-zinc-600 dark:text-zinc-300">{t("labs.section.languageBenchmarkDescription")}</p>
            <a data-route href="/labs/benchmark/languages" className="mt-3 inline-flex items-center gap-2 font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-200 dark:hover:text-amber-100">
              {t("labs.section.languageBenchmarkCta")}
              <ArrowRight size={16} />
            </a>
          </div>

          {benchmarkLoading ? (
            <div className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
              <div className="flex items-start gap-4">
                <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-300 border-t-teal-500 animate-spin dark:border-zinc-700 dark:border-t-teal-300" />
                <div>
                  <p className="text-lg font-semibold">{t("labs.section.collectingTitle")}</p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("labs.section.benchmarkPlaceholder")}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 overflow-hidden rounded-lg border border-zinc-950/10 bg-white/72 shadow-sm dark:border-white/10 dark:bg-white/8">
              {sortedEntries.length ? (
                <ol className="divide-y divide-zinc-950/8 dark:divide-white/10">
                  {sortedEntries.map((entry) => (
                    <li
                      key={entry.slug}
                      onClick={benchmarkSelectMode ? () => toggleBenchmarkCompare(entry.slug) : undefined}
                      role={benchmarkSelectMode ? "button" : undefined}
                      tabIndex={benchmarkSelectMode ? 0 : undefined}
                      onKeyDown={benchmarkSelectMode ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleBenchmarkCompare(entry.slug);
                        }
                      } : undefined}
                      className={`flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-start sm:justify-between ${
                        benchmarkSelectMode && benchmarkCompareSlugs.includes(entry.slug)
                          ? "bg-teal-50/70 dark:bg-teal-400/10"
                          : ""
                      } ${
                        benchmarkSelectMode
                          ? "cursor-pointer hover:bg-teal-50/50 dark:hover:bg-teal-400/5"
                          : ""
                      }`}
                    >
                      <div className={`flex gap-4 ${benchmarkSelectMode ? "items-center justify-between" : "items-start"}`}>
                        <div className="flex items-start gap-4">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
                            #{benchmarkRankMap.get(entry.slug) ?? "-"}
                          </span>
                          <div>
                            {benchmarkSelectMode ? (
                              <p className="text-lg font-semibold">{entry.name}</p>
                            ) : (
                              <a data-route href={`/labs/benchmark/${entry.slug}`} className="text-lg font-semibold hover:text-teal-600 dark:hover:text-teal-300">
                                {entry.name}
                              </a>
                            )}
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("labs.benchmarkModes.automated")}</p>
                          </div>
                        </div>
                        {benchmarkSelectMode ? (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              benchmarkCompareSlugs.includes(entry.slug)
                                ? "bg-teal-500 text-zinc-950"
                                : "bg-zinc-950/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
                            }`}
                          >
                            {benchmarkCompareSlugs.includes(entry.slug)
                              ? t("benchmarkCompare.selected", { defaultValue: "Selected" })
                              : t("benchmarkCompare.tapToSelect", { defaultValue: "Tap to select" })}
                          </span>
                        ) : null}
                      </div>

                      <div className="grid gap-3 text-sm sm:text-right">
                        <div className="grid gap-1">
                        <p className="font-mono font-semibold">
                          {getBenchmarkProfileStatus(entry, benchmarkProfile, benchmarkLanguage, benchmarkSize) === "available"
                            ? formatBenchmarkMetric(getBenchmarkProfileMetric(entry, benchmarkProfile, benchmarkLanguage, benchmarkSize), entry.unit ?? "ms")
                            : t("benchmark.status.canceled")}
                        </p>
                        {typeof getCompositeScore(entry) === "number" ? (
                          <p className="text-zinc-500 dark:text-zinc-400">
                            {t("benchmarkDetail.fields.composite")}: {getCompositeScore(entry)?.toFixed(1)}
                          </p>
                        ) : (
                          <p className="text-zinc-500 dark:text-zinc-400">{t("labs.section.benchmarkNoPoints")}</p>
                        )}
                        {benchmarkProfile === "random-uniform" && typeof getSizeScore(entry, benchmarkLanguage, benchmarkSize) === "number" ? (
                          <p className="text-zinc-500 dark:text-zinc-400">
                            {t("benchmarkDetail.sizeScore")} {getSizeScore(entry, benchmarkLanguage, benchmarkSize)?.toFixed(1)}
                          </p>
                        ) : null}
                        <p className="text-zinc-500 dark:text-zinc-400">
                          {t("labs.benchmarkSizes.small")}: {formatBenchmarkMetric(
                            getBenchmarkProfileMetric(entry, benchmarkProfile, benchmarkLanguage, "small"),
                            entry.unit ?? "ms",
                          )}
                        </p>
                        <p className="text-zinc-500 dark:text-zinc-400">
                          {t("labs.benchmarkSizes.medium")}: {formatBenchmarkMetric(
                            getBenchmarkProfileMetric(entry, benchmarkProfile, benchmarkLanguage, "medium"),
                            entry.unit ?? "ms",
                          )}
                        </p>
                        <p className="text-zinc-500 dark:text-zinc-400">
                          {t("labs.benchmarkSizes.large")}: {getBenchmarkProfileStatus(entry, benchmarkProfile, benchmarkLanguage, "large") === "canceled"
                            ? t("benchmark.status.canceled")
                            : formatBenchmarkMetric(getBenchmarkProfileMetric(entry, benchmarkProfile, benchmarkLanguage, "large"), entry.unit ?? "ms")}
                        </p>
                        </div>
                      </div>
                    </li>
                  ))}
                  <li className="flex items-center gap-4 px-5 py-4">
                    <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-dashed border-zinc-950/15 px-2 text-xs font-semibold text-zinc-500 dark:border-white/15 dark:text-zinc-400">
                      ...
                    </span>
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{t("labs.section.moreComing")}</p>
                  </li>
                </ol>
              ) : (
                <div className="px-5 py-6 text-sm text-zinc-500 dark:text-zinc-400">
                  {hasAlgorithmQuery
                    ? t("labs.search.noAlgorithms")
                    : isBenchmarkSizeCanceled(benchmarkLanguage, benchmarkSize)
                      ? t("benchmark.status.pythonLargeCanceled")
                      : t("labs.section.benchmarkUnavailable")}
                </div>
              )}
            </div>
          )}
        </section>
        {benchmarkDoc ? <SectionDocButton link={benchmarkDoc} /> : null}
      </>
    );
  }

  function renderEvents() {
    const eventsDoc = eventsDocsLinks[0];
    const visibleEntries = hasAlgorithmQuery ? filteredEventEntries : eventEntries;

    return (
      <>
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="rounded-lg border border-zinc-950/10 bg-white/72 p-8 shadow-sm dark:border-white/10 dark:bg-white/8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">{t("labs.section.eventsEyebrow")}</p>
            <div className="mt-4 flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-4xl">
                <h2 className="text-4xl font-semibold tracking-tight">{activeEvent?.name ?? t("labs.blocks.events.title")}</h2>
                <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">{t("labs.section.eventsDescription")}</p>
                <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">{t("labs.section.eventsExtendedDescription")}</p>
              </div>

              {activeEvent ? (
                <div className="w-full max-w-sm rounded-lg bg-zinc-950/[0.04] p-5 dark:bg-white/[0.06]">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{t("labs.section.activeEvent")}</p>
                  <p className="mt-2 text-xl font-semibold">{activeEvent.theme}</p>
                  <dl className="mt-5 space-y-4 text-sm">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{t("labs.labels.dates")}</dt>
                      <dd className="mt-2 font-medium">{formatDate(activeEvent.startDate)} - {formatDate(activeEvent.endDate)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{t("labs.labels.categories")}</dt>
                      <dd className="mt-2 flex flex-wrap gap-2">
                        {activeEvent.categories?.map((category) => (
                          <span key={category} className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
                            {category}
                          </span>
                        ))}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="max-w-3xl">
            <h3 className="text-3xl font-semibold tracking-tight">{t("labs.section.eventRankingTitle")}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("labs.section.eventsRankingDescription")}</p>
          </div>

          {eventLoading ? (
            <div className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-6 shadow-sm dark:border-white/10 dark:bg-white/8">
              <div className="flex items-start gap-4">
                <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-300 border-t-teal-500 animate-spin dark:border-zinc-700 dark:border-t-teal-300" />
                <div>
                  <p className="text-lg font-semibold">{t("labs.section.collectingTitle")}</p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("labs.section.eventsPlaceholder")}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 overflow-hidden rounded-lg border border-zinc-950/10 bg-white/72 shadow-sm dark:border-white/10 dark:bg-white/8">
              {visibleEntries.length ? (
                <ol className="divide-y divide-zinc-950/8 dark:divide-white/10">
                  {visibleEntries.map((entry) => (
                    <li key={`${entry.slug}-${entry.category}`} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
                          #{eventRankMap.get(`${entry.slug}-${entry.category}`) ?? "-"}
                        </span>
                        <div>
                          <a data-route href={`/algo/${entry.slug}`} className="text-lg font-semibold hover:text-teal-600 dark:hover:text-teal-300">
                            {entry.name}
                          </a>
                          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{entry.category}</p>
                        </div>
                      </div>
                      <div className="grid gap-1 text-sm sm:text-right">
                        <p className="font-mono font-semibold">{entry.score}</p>
                        <p className="text-zinc-500 dark:text-zinc-400">{entry.event ?? activeEvent?.name}</p>
                      </div>
                    </li>
                  ))}
                  <li className="flex items-center gap-4 px-5 py-4">
                    <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-dashed border-zinc-950/15 px-2 text-xs font-semibold text-zinc-500 dark:border-white/15 dark:text-zinc-400">
                      ...
                    </span>
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{t("labs.section.moreComing")}</p>
                  </li>
                </ol>
              ) : (
                <div className="px-5 py-6 text-sm text-zinc-500 dark:text-zinc-400">
                  {hasAlgorithmQuery ? t("labs.search.noAlgorithms") : t("labs.section.eventsPlaceholder")}
                </div>
              )}
            </div>
          )}
        </section>
        {eventsDoc ? <SectionDocButton link={eventsDoc} /> : null}
      </>
    );
  }

  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main>
        <section className="relative overflow-hidden border-b border-zinc-950/10 bg-zinc-950/[0.02] dark:border-white/10 dark:bg-white/[0.03]">
          <div className="absolute inset-0 opacity-70 dark:opacity-50">
            <div className="h-full w-full bg-[linear-gradient(120deg,rgba(20,184,166,0.08),transparent_36%),linear-gradient(220deg,rgba(244,63,94,0.08),transparent_34%)]" />
          </div>
          <div className="relative mx-auto max-w-6xl px-5 py-20">
            <a
              data-route
              href={section === "overview" ? "/" : "/labs"}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:-translate-x-0.5 dark:border-white/10 dark:bg-white/10"
            >
              <ArrowLeft size={16} />
              {section === "overview" ? t("algorithm.back") : t("labs.back")}
            </a>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">{t("labs.label")}</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">{t("labs.title")}</h1>
            <p className="mt-5 max-w-3xl text-2xl font-semibold tracking-tight text-zinc-700 dark:text-zinc-200">{t("labs.subtitle")}</p>
            <div className="mt-8 max-w-3xl space-y-4 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
              <p>{t("labs.description")}</p>
              <p>{t("labs.descriptionSecondary")}</p>
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  data-route
                  href={item.href}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    section === item.id
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                      : "border border-zinc-950/10 bg-white/70 text-zinc-700 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
            {section !== "overview" ? (
              <div className="mt-6 max-w-xl">
                <label htmlFor="labs-algorithm-search" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                  {t("labs.search.label")}
                </label>
                <input
                  id="labs-algorithm-search"
                  type="search"
                  value={algorithmQuery}
                  onChange={(event) => setAlgorithmQuery(event.target.value)}
                  placeholder={t("labs.search.algorithmsPlaceholder")}
                  className="mt-3 w-full rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-white/10"
                />
              </div>
            ) : null}
          </div>
        </section>

        {section === "overview" ? renderOverview() : null}
        {section === "community" ? renderCommunity() : null}
        {section === "benchmark" ? renderBenchmark() : null}
        {section === "events" ? renderEvents() : null}

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="flex flex-col items-start gap-4 border-t border-zinc-950/10 pt-12 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("labs.finalCta.description")}</p>
            </div>
            <a
              data-route
              href="/contribute"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950"
            >
              {t("labs.finalCta.label")}
              <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
