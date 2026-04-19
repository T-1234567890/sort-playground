import { Trophy } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Algorithm, StepAction } from "../core/types";

type SortRunCardProps = {
  algorithm: Algorithm;
  steps: ReturnType<Algorithm["steps"]>;
  stepIndex: number;
  rank?: number;
  compact?: boolean;
};

const actionColors: Record<StepAction, string> = {
  compare: "bg-amber-400",
  swap: "bg-rose-500",
  overwrite: "bg-sky-500",
  delete: "bg-rose-500",
  sorted: "bg-emerald-400",
};

function countActions(steps: ReturnType<Algorithm["steps"]>) {
  return steps.reduce(
    (totals, step) => ({
      ...totals,
      [step.action]: totals[step.action] + 1,
    }),
    {
      compare: 0,
      swap: 0,
      overwrite: 0,
      delete: 0,
      sorted: 0,
    } satisfies Record<StepAction, number>,
  );
}

export function SortRunCard({ algorithm, steps, stepIndex, rank, compact = false }: SortRunCardProps) {
  const { t } = useTranslation();
  const activeStep = steps[Math.min(stepIndex, steps.length - 1)] ?? steps[0];
  const progress = steps.length > 1 ? (Math.min(stepIndex, steps.length - 1) / (steps.length - 1)) * 100 : 100;
  const maxValue = Math.max(...(activeStep?.array ?? []).map((value) => Math.max(value, 0)), 1);
  const counts = useMemo(() => countActions(steps), [steps]);
  const isDone = stepIndex >= steps.length - 1;

  return (
    <article className="flex h-full flex-col rounded-lg border border-zinc-950/10 bg-white/72 p-4 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">{algorithm.category}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">{algorithm.name}</h2>
          <p className="mt-1 text-xs font-mono text-zinc-500 dark:text-zinc-400">{algorithm.complexity}</p>
        </div>
        {rank ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-900 dark:bg-teal-300/15 dark:text-teal-200">
            <Trophy size={13} />
            #{rank}
          </span>
        ) : (
          <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold text-zinc-950 ${actionColors[activeStep?.action ?? "compare"]}`}>
            {t(`visualizer.actions.${activeStep?.action ?? "compare"}`)}
          </span>
        )}
      </div>

      <div className={`mt-4 flex items-stretch gap-1.5 rounded-lg bg-zinc-950 p-3 ${compact ? "h-36" : "h-56"}`}>
        {(activeStep?.array ?? []).map((value, index) => {
          const isActive = activeStep?.indices?.includes(index);
          const color = activeStep?.action === "sorted"
            ? "bg-emerald-400"
            : isActive
              ? actionColors[activeStep?.action ?? "compare"]
              : "bg-zinc-500";

          return (
            <div key={`${algorithm.slug}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div className="flex min-h-0 w-full flex-1 items-end">
                <div
                  className={`min-h-px w-full rounded-t-lg transition-all duration-300 ${color}`}
                  style={{ height: `${(Math.max(value, 0) / maxValue) * 100}%` }}
                  aria-label={`Value ${value}`}
                />
              </div>
              {!compact ? (
                <span className="max-w-full truncate text-[10px] font-medium tabular-nums text-zinc-300">{value}</span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span>{isDone ? t("race.done") : t("visualizer.progress")}</span>
          <span className="font-mono">{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
          <div className="h-full rounded-lg bg-teal-500 transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-zinc-950/5 p-2 dark:bg-white/10">
          <dt className="text-zinc-500 dark:text-zinc-400">{t("compare.steps")}</dt>
          <dd className="mt-1 font-mono font-semibold">{steps.length}</dd>
        </div>
        <div className="rounded-lg bg-zinc-950/5 p-2 dark:bg-white/10">
          <dt className="text-zinc-500 dark:text-zinc-400">{t("compare.compares")}</dt>
          <dd className="mt-1 font-mono font-semibold">{counts.compare}</dd>
        </div>
        <div className="rounded-lg bg-zinc-950/5 p-2 dark:bg-white/10">
          <dt className="text-zinc-500 dark:text-zinc-400">{t("compare.moves")}</dt>
          <dd className="mt-1 font-mono font-semibold">{counts.swap + counts.overwrite + counts.delete}</dd>
        </div>
      </dl>
    </article>
  );
}
