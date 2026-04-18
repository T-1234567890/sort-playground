import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Algorithm } from "../core/types";
import { AlgorithmCard } from "./AlgorithmCard";

const tags = ["All", "Classic", "Weird", "Meme", "Fast", "Slow", "Chaos"] as const;

type AlgorithmExplorerProps = {
  algorithms: Algorithm[];
  pageSize?: number;
};

export function AlgorithmExplorer({ algorithms, pageSize = 6 }: AlgorithmExplorerProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<(typeof tags)[number]>("All");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const filteredAlgorithms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedTag = activeTag.toLowerCase();

    return algorithms
      .filter((algorithm) => {
        const searchable = [
          algorithm.name,
          algorithm.category,
          algorithm.description,
          algorithm.complexity,
          ...(algorithm.keywords ?? []),
        ]
          .join(" ")
          .toLowerCase();
        const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
        const matchesTag =
          activeTag === "All" ||
          algorithm.category === normalizedTag ||
          algorithm.keywords?.some((keyword) => keyword.toLowerCase() === normalizedTag);

        return matchesQuery && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "complexity") {
          return a.complexity.localeCompare(b.complexity);
        }
        if (sortBy === "fun") {
          return (b.funRank ?? 0) - (a.funRank ?? 0);
        }

        return (b.added ?? "").localeCompare(a.added ?? "");
      });
  }, [activeTag, algorithms, query, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filteredAlgorithms.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleAlgorithms = filteredAlgorithms.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [activeTag, query, sortBy]);

  return (
    <>
      <div className="rounded-lg border border-zinc-950/10 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("explorer.search")}
              className="w-full rounded-lg border border-zinc-950/10 bg-white px-10 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-zinc-950"
            />
          </label>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-lg border border-zinc-950/10 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-zinc-950"
            aria-label={t("explorer.sortLabel")}
          >
            <option value="name">{t("explorer.sort.name")}</option>
            <option value="complexity">{t("explorer.sort.complexity")}</option>
            <option value="newest">{t("explorer.sort.newest")}</option>
            <option value="fun">{t("explorer.sort.fun")}</option>
          </select>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                activeTag === tag
                  ? "bg-teal-500 text-zinc-950"
                  : "bg-zinc-950/5 text-zinc-600 hover:bg-zinc-950/10 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/15"
              }`}
            >
              {t(`explorer.tags.${tag}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleAlgorithms.map((algorithm) => (
          <AlgorithmCard key={algorithm.slug} algorithm={algorithm} />
        ))}
      </div>

      {visibleAlgorithms.length === 0 ? (
        <p className="mt-8 rounded-lg border border-zinc-950/10 bg-white/70 p-5 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/8 dark:text-zinc-300">
          {t("explorer.empty")}
        </p>
      ) : null}

      {filteredAlgorithms.length > 0 ? (
        <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-lg bg-white/60 p-3 ring-1 ring-zinc-950/5 backdrop-blur-xl dark:bg-white/8 dark:ring-white/10 sm:flex-row">
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {t("pagination.page", { current: currentPage, total: pageCount })}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 px-3 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
            >
              <ChevronLeft size={16} />
              {t("pagination.previous")}
            </button>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              disabled={currentPage === pageCount}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 px-3 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
            >
              {t("pagination.next")}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
