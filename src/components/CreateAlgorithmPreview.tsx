import { Pause, Play, RotateCcw, Shuffle, TriangleAlert } from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_ARRAY, datasetArray, parseArrayInput } from "../core/visualizer";
import { stripPreviewOnlyImports } from "../core/createAlgorithm";
import { useSettings } from "../hooks/useSettings";
import type { Step } from "../core/types";

type CreateAlgorithmPreviewProps = {
  code: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  initialSampleArray?: number[];
  onSampleArrayChange?: (nextArray: number[]) => void;
};

type PreviewWorkerResult =
  | {
      id: number;
      ok: true;
      steps: Step[];
    }
  | {
      id: number;
      ok: false;
      error: string;
    };

const actionColors: Record<Step["action"], string> = {
  compare: "bg-amber-400 text-zinc-950",
  swap: "bg-rose-500 text-white",
  overwrite: "bg-sky-500 text-white",
  delete: "bg-rose-500 text-white",
  sorted: "bg-emerald-400 text-zinc-950",
};

function buildFallbackStep(input: number[]): Step {
  return {
    array: input,
    action: "compare",
    indices: [],
  };
}

export function CreateAlgorithmPreview({
  code,
  eyebrow,
  title,
  description,
  initialSampleArray = DEFAULT_ARRAY,
  onSampleArrayChange,
}: CreateAlgorithmPreviewProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const resolvedEyebrow = eyebrow ?? t("create.preview.liveEyebrow");
  const resolvedTitle = title ?? t("create.preview.defaultTitle");
  const resolvedDescription = description ?? t("create.preview.defaultDescription");
  const deferredCode = useDeferredValue(code);
  const [sampleArray, setSampleArray] = useState(initialSampleArray);
  const [sampleInput, setSampleInput] = useState(initialSampleArray.join(", "));
  const [steps, setSteps] = useState<Step[]>([buildFallbackStep(initialSampleArray)]);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [speed, setSpeed] = useState(1.25);
  const requestIdRef = useRef(0);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const previewSource = useMemo(() => stripPreviewOnlyImports(deferredCode), [deferredCode]);
  const activeStep = steps[Math.min(stepIndex, steps.length - 1)] ?? buildFallbackStep(sampleArray);
  const maxValue = Math.max(...activeStep.array.map((value) => Math.max(value, 0)), 1);
  const progress = steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 0;

  useEffect(() => {
    setSampleArray(initialSampleArray);
    setSampleInput(initialSampleArray.join(", "));
  }, [initialSampleArray]);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    workerRef.current?.terminate();
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const runId = requestIdRef.current + 1;
    requestIdRef.current = runId;

    const debounceId = window.setTimeout(() => {
      setIsRunning(true);
      setError(null);

      const worker = new Worker(new URL("../workers/algorithmPreview.worker.ts", import.meta.url), {
        type: "module",
      });

      workerRef.current = worker;

      timeoutRef.current = window.setTimeout(() => {
        worker.terminate();
        workerRef.current = null;
        setIsRunning(false);
        setIsPlaying(false);
        setError(t("create.preview.errors.timeout"));
      }, 1200);

      worker.onmessage = (event: MessageEvent<PreviewWorkerResult>) => {
        const result = event.data;

        if (result.id !== requestIdRef.current) {
          return;
        }

        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        worker.terminate();
        workerRef.current = null;

        if (!result.ok) {
          setIsRunning(false);
          setIsPlaying(false);
          setError(result.error);
          return;
        }

        startTransition(() => {
          setSteps(result.steps);
          setStepIndex(0);
          setIsRunning(false);
          setIsPlaying(result.steps.length > 1);
          setError(null);
        });
      };

      worker.postMessage({
        id: runId,
        code: previewSource,
        input: sampleArray,
      });
    }, 400);

    return () => {
      window.clearTimeout(debounceId);
      workerRef.current?.terminate();
      workerRef.current = null;
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [previewSource, sampleArray]);

  useEffect(() => {
    if (!isPlaying || steps.length <= 1) {
      return;
    }

    const tickId = window.setInterval(() => {
      setStepIndex((current) => {
        if (current >= steps.length - 1) {
          window.clearInterval(tickId);
          setIsPlaying(false);
          return current;
        }

        return current + 1;
      });
    }, Math.max(140, 520 / speed));

    return () => window.clearInterval(tickId);
  }, [isPlaying, speed, steps.length]);

  function resetPlayback() {
    setStepIndex(0);
    setIsPlaying(false);
  }

  function applySampleInput() {
    const parsed = parseArrayInput(sampleInput);

    if (parsed.length > 1) {
      setSampleArray(parsed);
      onSampleArrayChange?.(parsed);
    }
  }

  function randomizeSample() {
    const next = datasetArray(settings.defaultDataset, 10);
    setSampleArray(next);
    setSampleInput(next.join(", "));
    onSampleArrayChange?.(next);
  }

  return (
    <section className="rounded-3xl border border-zinc-950/10 bg-white/85 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">{resolvedEyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{resolvedTitle}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {resolvedDescription.split("`").map((part, index) => (
              index % 2 === 1 ? <code key={`${part}-${index}`}>{part}</code> : <span key={`${part}-${index}`}>{part}</span>
            ))}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            error ? "bg-rose-500 text-white" : isRunning ? "bg-amber-300 text-zinc-950" : actionColors[activeStep.action]
          }`}
        >
          {error ? t("create.preview.errorBadge") : isRunning ? t("create.preview.runningBadge") : activeStep.action}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
          <span>{t("create.preview.playback")}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-teal-500 transition-[width] duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-6 flex h-[24rem] items-stretch gap-2 overflow-hidden rounded-3xl border border-zinc-950/10 bg-zinc-100/90 p-4 dark:border-white/10 dark:bg-zinc-900">
        {activeStep.array.map((value, index) => {
          const isActive = activeStep.indices?.includes(index);
          const height = `${(Math.max(value, 0) / maxValue) * 100}%`;
          const barColor = activeStep.action === "sorted"
            ? "bg-emerald-400"
            : isActive && activeStep.action === "compare"
              ? "bg-amber-400"
              : isActive && (activeStep.action === "swap" || activeStep.action === "delete")
                ? "bg-rose-500"
                : isActive && activeStep.action === "overwrite"
                  ? "bg-sky-500"
                  : "bg-zinc-400 dark:bg-zinc-600";

          return (
            <div key={`${index}-${value}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex min-h-0 w-full flex-1 items-end">
                <div className={`min-h-px w-full rounded-t-2xl transition-all duration-300 ease-out ${barColor}`} style={{ height }} />
              </div>
              <span className="text-[11px] font-medium tabular-nums text-zinc-500 dark:text-zinc-400">{value}</span>
            </div>
          );
        })}
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-50 p-4 text-sm leading-6 text-rose-950 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">{t("create.preview.failed")}</p>
              <p className="mt-1 whitespace-pre-wrap break-words">{error}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying((current) => (steps.length > 1 ? !current : false))}
            disabled={isRunning || steps.length <= 1}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-white dark:text-zinc-950"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? t("create.preview.pause") : t("create.preview.play")}
          </button>
          <button
            type="button"
            onClick={resetPlayback}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-950/10 px-3 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
          >
            <RotateCcw size={16} />
            {t("create.preview.reset")}
          </button>
          <button
            type="button"
            onClick={randomizeSample}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-950/10 px-3 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
          >
            <Shuffle size={16} />
            {t("create.preview.randomize")}
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-950/10 bg-white/75 p-4 dark:border-white/10 dark:bg-white/8">
          <div className="flex items-center justify-between gap-3 text-sm">
            <label htmlFor="preview-speed" className="font-medium text-zinc-600 dark:text-zinc-300">
              {t("create.preview.speed")}
            </label>
            <span className="font-mono text-zinc-500 dark:text-zinc-400">{speed.toFixed(2)}x</span>
          </div>
          <input
            id="preview-speed"
            type="range"
            min="0.75"
            max="2.5"
            step="0.25"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
            className="mt-3 w-full accent-teal-500"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
        <label className="rounded-2xl border border-zinc-950/10 bg-white/75 p-4 text-sm dark:border-white/10 dark:bg-white/8">
          <span className="font-medium text-zinc-600 dark:text-zinc-300">{t("create.preview.sampleArray")}</span>
          <input
            value={sampleInput}
            onChange={(event) => setSampleInput(event.target.value)}
            className="mt-3 w-full rounded-xl border border-zinc-950/10 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-zinc-900"
          />
        </label>
        <button
          type="button"
          onClick={applySampleInput}
          className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-500"
        >
          {t("create.preview.applySample")}
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-950/10 bg-zinc-950/5 p-4 text-sm leading-6 text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
        <p className="font-semibold text-zinc-950 dark:text-zinc-50">{t("create.preview.guardrailsTitle")}</p>
        <p className="mt-1">
          {t("create.preview.guardrailsBody")}
        </p>
      </div>
    </section>
  );
}
