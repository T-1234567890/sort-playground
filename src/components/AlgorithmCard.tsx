import { ArrowUpRight } from "lucide-react";
import type { Algorithm } from "../core/types";

const categoryStyles = {
  classic: "bg-emerald-100 text-emerald-900 dark:bg-emerald-300/15 dark:text-emerald-200",
  weird: "bg-cyan-100 text-cyan-900 dark:bg-cyan-300/15 dark:text-cyan-200",
  meme: "bg-rose-100 text-rose-900 dark:bg-rose-300/15 dark:text-rose-200",
};

type AlgorithmCardProps = {
  algorithm: Algorithm;
};

export function AlgorithmCard({ algorithm }: AlgorithmCardProps) {
  return (
    <a
      data-route
      href={`/algo/${algorithm.slug}`}
      className="group flex h-full min-h-[356px] flex-col rounded-lg border border-zinc-950/10 bg-white/74 p-5 shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-soft dark:border-white/10 dark:bg-white/8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase ${categoryStyles[algorithm.category]}`}>
            {algorithm.category}
          </span>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight">{algorithm.name}</h2>
        </div>
        <ArrowUpRight className="mt-1 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-teal-600" />
      </div>
      <p className="mt-4 line-clamp-3 min-h-[72px] text-sm leading-6 text-zinc-600 dark:text-zinc-300">{algorithm.description}</p>
      {algorithm.keywords?.length ? (
        <div className="mt-5 flex min-h-[64px] flex-wrap content-start gap-2">
          {algorithm.keywords.slice(0, 3).map((keyword) => (
            <span
              key={keyword}
              className="rounded-lg bg-zinc-950/5 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
            >
              {keyword}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-auto border-t border-zinc-950/10 pt-4 text-sm dark:border-white/10">
        <div className="flex items-center justify-between gap-3">
          <span className="text-zinc-500 dark:text-zinc-400">Time</span>
          <span className="text-right font-mono font-semibold">{algorithm.complexity}</span>
        </div>
        {algorithm.added ? (
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-zinc-500 dark:text-zinc-400">Added</span>
            <span className="font-mono text-xs font-semibold">{algorithm.added}</span>
          </div>
        ) : null}
      </div>
    </a>
  );
}
