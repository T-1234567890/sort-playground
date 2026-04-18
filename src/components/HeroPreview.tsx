import { useEffect, useMemo, useState } from "react";
import type { Algorithm } from "../core/types";

const previewInput = [46, 18, 71, 12, 63, 29, 88, 54, 33, 77, 21, 60];

type HeroPreviewProps = {
  algorithms: Algorithm[];
};

export function HeroPreview({ algorithms }: HeroPreviewProps) {
  const [stepIndex, setStepIndex] = useState(0);

  const algorithm = useMemo(() => {
    return algorithms.find((item) => item.slug === "quick-sort") ?? algorithms[0];
  }, [algorithms]);

  const steps = useMemo(() => algorithm?.steps(previewInput) ?? [], [algorithm]);
  const step = steps[stepIndex] ?? steps[0];
  const maxValue = Math.max(...previewInput, 1);

  useEffect(() => {
    if (!steps.length) {
      return;
    }

    const interval = window.setInterval(() => {
      setStepIndex((index) => (index + 1) % steps.length);
    }, 420);

    return () => window.clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="animate-rise-in">
      <div className="rounded-lg border border-zinc-950/10 bg-white/70 p-4 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">Live preview</p>
            <p className="mt-1 text-xl font-semibold tracking-tight">{algorithm?.name}</p>
          </div>
          <span className="rounded-lg bg-zinc-950 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-zinc-950">
            {step?.action ?? "compare"}
          </span>
        </div>
        <div className="mt-6 flex h-64 items-stretch gap-2 rounded-lg bg-zinc-950 p-4">
          {(step?.array ?? previewInput).map((value, index) => {
            const active = step?.indices?.includes(index);
            const color =
              step?.action === "sorted"
                ? "bg-emerald-400"
                : active && step?.action === "compare"
                  ? "bg-amber-400"
                  : active
                    ? "bg-rose-500"
                    : "bg-zinc-500";

            return (
              <div key={`quick-sort-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex min-h-0 w-full flex-1 items-end">
                  <div
                    className={`min-h-px w-full rounded-t-lg transition-all duration-300 ${color}`}
                    style={{ height: `${(value / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium tabular-nums text-zinc-300">{value}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-lg bg-teal-500 transition-[width] duration-300"
            style={{ width: `${steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}
