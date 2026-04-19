import { Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_ARRAY, parseArrayInput } from "../core/visualizer";
import type { Algorithm, Step } from "../core/types";

type EmbedPageProps = {
  algorithm: Algorithm;
};

const actionColors = {
  compare: "bg-amber-400",
  swap: "bg-rose-500",
  overwrite: "bg-sky-500",
  delete: "bg-rose-500",
  sorted: "bg-emerald-400",
};

function getInitialArray() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = parseArrayInput(params.get("array") ?? "");

  return fromQuery.length > 1 ? fromQuery.slice(0, 18) : DEFAULT_ARRAY;
}

function getControlsMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("controls") ?? "minimal";
}

export function EmbedPage({ algorithm }: EmbedPageProps) {
  const { t } = useTranslation();
  const [baseArray] = useState(getInitialArray);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef(0);
  const pauseUntilRef = useRef<number | null>(null);
  const controlsMode = getControlsMode();
  const showControls = controlsMode !== "none";

  const steps = useMemo(() => algorithm.steps(baseArray), [algorithm, baseArray]);
  const activeStep: Step = steps[Math.min(stepIndex, steps.length - 1)] ?? {
    array: baseArray,
    action: "compare",
  };
  const maxValue = Math.max(...baseArray.map((value) => Math.max(value, 0)), 1);
  const progress = steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 100;
  const isFinished = stepIndex >= steps.length - 1;

  const stopAnimation = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  useEffect(() => stopAnimation, [stopAnimation]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    let lastTimestamp = 0;
    const delay = 520;

    const tick = (timestamp: number) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      if (pauseUntilRef.current && timestamp < pauseUntilRef.current) {
        lastTimestamp = timestamp;
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      if (pauseUntilRef.current && timestamp >= pauseUntilRef.current) {
        pauseUntilRef.current = null;
        setStepIndex(0);
      }

      timerRef.current += timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (timerRef.current >= delay) {
        timerRef.current = 0;
        setStepIndex((index) => {
          if (index >= steps.length - 1) {
            pauseUntilRef.current = timestamp + 900;
            return index;
          }

          return index + 1;
        });
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return stopAnimation;
  }, [isRunning, steps.length, stopAnimation]);

  function reset() {
    timerRef.current = 0;
    pauseUntilRef.current = null;
    setStepIndex(0);
    setIsRunning(true);
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-4 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-3xl flex-col rounded-lg border border-zinc-950/10 bg-white/80 p-4 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/8 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">Sort Playground</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{algorithm.name}</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              {algorithm.complexity} · {t(`visualizer.actions.${activeStep.action}`)}
            </p>
          </div>
          <span
            className={`rounded-lg px-3 py-1 text-sm font-semibold text-zinc-950 ${actionColors[activeStep.action]}`}
          >
            {Math.round(progress)}%
          </span>
        </div>

        <div
          className="mt-5 h-2 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800"
          role="progressbar"
          aria-label={t("visualizer.progress")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="h-full rounded-lg bg-teal-500 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-6 flex min-h-0 flex-1 items-stretch gap-2 overflow-hidden rounded-lg bg-zinc-100/80 p-4 dark:bg-zinc-900">
          {activeStep.array.map((value, index) => {
            const isActive = activeStep.indices?.includes(index);
            const isSorted = activeStep.action === "sorted";
            const height = `${(Math.max(value, 0) / maxValue) * 100}%`;
            const color = isSorted
              ? "bg-emerald-400 animate-sorted"
              : isActive && activeStep.action === "compare"
                ? "bg-amber-400"
                : isActive && activeStep.action === "overwrite"
                  ? "bg-sky-500"
                  : isActive && (activeStep.action === "swap" || activeStep.action === "delete")
                  ? "bg-rose-500"
                  : "bg-zinc-400 dark:bg-zinc-600";

            return (
              <div key={`${algorithm.slug}-embed-${index}`} className="flex h-full min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex min-h-0 w-full flex-1 items-end">
                  <div
                    className={`min-h-px w-full rounded-t-lg transition-all duration-300 ease-out ${color}`}
                    style={{ height }}
                    title={`${value}`}
                    aria-label={`Value ${value}`}
                  />
                </div>
                <span className="h-5 max-w-full truncate text-[11px] font-medium tabular-nums text-zinc-600 dark:text-zinc-300">
                  {value}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {t("visualizer.step")} {Math.min(stepIndex + 1, steps.length)} {t("visualizer.of")} {steps.length}
            {isFinished ? ` · ${t("visualizer.sortedResult")}` : ""}
          </p>
          {showControls ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsRunning((value) => !value)}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 px-3 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
              >
                {isRunning ? <Pause size={15} /> : <Play size={15} />}
                {isRunning ? t("controls.pause") : t("controls.start")}
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950"
              >
                <RotateCcw size={15} />
                {t("controls.reset")}
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
