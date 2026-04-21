import { Check, Download, Film, Image, Pause, Play, RotateCcw, Share2, Shuffle, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmbedShare } from "./EmbedShare";
import { ExportCard } from "./ExportCard";
import { exportGif, exportPng, exportShareCard } from "../core/exporters";
import { createAudioContext, playStepSound, resumeAudioContext, type SortAudioContext } from "../core/sound";
import { datasetArray, parseArrayInput, sortAscending } from "../core/visualizer";
import { useSettings } from "../hooks/useSettings";
import type { Algorithm, Step } from "../core/types";

const actionColors = {
  compare: "bg-amber-400",
  swap: "bg-rose-500",
  overwrite: "bg-sky-500",
  delete: "bg-rose-500",
  sorted: "bg-emerald-400",
};

type VisualizerProps = {
  algorithm: Algorithm;
};

function isSorted(array: number[]) {
  return array.every((value, index) => index === 0 || array[index - 1] <= value);
}

function moveItem(array: number[], fromIndex: number, toIndex: number) {
  const next = [...array];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function Visualizer({ algorithm }: VisualizerProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const initialArray = useMemo(() => datasetArray(settings.defaultDataset, 10), [settings.defaultDataset]);
  const [baseArray, setBaseArray] = useState(initialArray);
  const [input, setInput] = useState(initialArray.join(", "));
  const [speed, setSpeed] = useState(1.5);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.55);
  const [exportStatus, setExportStatus] = useState<"idle" | "png" | "share" | "gif">("idle");
  const [isGifExporting, setIsGifExporting] = useState(false);
  const [exportSection, setExportSection] = useState<"images" | "animation" | "embed">("images");
  const [manualArray, setManualArray] = useState(initialArray);
  const [manualStep, setManualStep] = useState<Step>({ array: initialArray, action: "compare", indices: [] });
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [scrubHover, setScrubHover] = useState<{ index: number; x: number } | null>(null);
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef(0);
  const audioRef = useRef<SortAudioContext | null>(null);
  const isManualSort = algorithm.slug === "manual-sort";
  const isRandomizedRun = algorithm.slug === "bogo-sort" || algorithm.slug === "bozo-sort";

  const steps = useMemo(() => (isManualSort ? [manualStep] : algorithm.steps(baseArray)), [algorithm, baseArray, isManualSort, manualStep]);
  const activeStep: Step = steps[Math.min(stepIndex, steps.length - 1)] ?? {
    array: baseArray,
    action: "compare",
  };
  const sortedResult = useMemo(() => sortAscending(isManualSort ? manualArray : baseArray), [baseArray, isManualSort, manualArray]);
  const maxValue = Math.max(...(isManualSort ? manualArray : baseArray).map((value) => Math.max(value, 0)), 1);
  const manualProgress = useMemo(() => {
    if (manualArray.length <= 1) {
      return 100;
    }

    const orderedPairs = manualArray.reduce((count, value, index) => {
      if (index === 0) {
        return count;
      }

      return count + (manualArray[index - 1] <= value ? 1 : 0);
    }, 0);

    return (orderedPairs / (manualArray.length - 1)) * 100;
  }, [manualArray]);
  const isFinished = isManualSort ? isSorted(manualArray) : stepIndex >= steps.length - 1;
  const progress = isManualSort ? manualProgress : steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 100;
  const stopAnimation = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  useEffect(() => stopAnimation, [stopAnimation]);

  useEffect(() => {
    return () => {
      void audioRef.current?.close();
    };
  }, []);

  useEffect(() => {
    setStepIndex(0);
    setIsRunning(false);
    setIsPaused(false);
    stopAnimation();
  }, [algorithm.slug, baseArray, stopAnimation]);

  useEffect(() => {
    if (!isManualSort) {
      return;
    }

    const nextStep: Step = {
      array: [...baseArray],
      action: isSorted(baseArray) ? "sorted" : "compare",
      indices: isSorted(baseArray) ? baseArray.map((_, index) => index) : [],
    };
    setManualArray(baseArray);
    setManualStep(nextStep);
    setDragIndex(null);
    setHoverIndex(null);
  }, [baseArray, isManualSort]);

  useEffect(() => {
    if (isManualSort || !isRunning || isPaused) {
      return;
    }

    const delay = 760 / speed;
    let lastTimestamp = 0;

    const tick = (timestamp: number) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      timerRef.current += timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (timerRef.current >= delay) {
        timerRef.current = 0;
        setStepIndex((index) => Math.min(index + 1, steps.length - 1));
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return stopAnimation;
  }, [isManualSort, isPaused, isRunning, speed, steps.length, stopAnimation]);

  useEffect(() => {
    if (!isManualSort && isRunning && stepIndex >= steps.length - 1) {
      setIsRunning(false);
    }
  }, [isManualSort, isRunning, stepIndex, steps.length]);

  useEffect(() => {
    if (isManualSort || !isRunning || isPaused || !soundEnabled || stepIndex === 0) {
      return;
    }

    playStepSound(audioRef.current, activeStep, maxValue, volume, speed);
  }, [activeStep, isManualSort, isPaused, isRunning, maxValue, soundEnabled, speed, stepIndex, volume]);

  async function start() {
    if (isManualSort) {
      return;
    }

    if (isFinished) {
      setStepIndex(0);
    }

    if (soundEnabled) {
      audioRef.current ??= createAudioContext();
      await resumeAudioContext(audioRef.current);
    }

    timerRef.current = 0;
    setIsPaused(false);
    setIsRunning(true);
  }

  function pause() {
    if (isManualSort) {
      return;
    }

    setIsPaused(true);
    setIsRunning(false);
    stopAnimation();
  }

  function reset() {
    timerRef.current = 0;
    setStepIndex(0);
    setIsRunning(false);
    setIsPaused(false);
    stopAnimation();
    if (isManualSort) {
      setManualArray(baseArray);
      setManualStep({
        array: [...baseArray],
        action: isSorted(baseArray) ? "sorted" : "compare",
        indices: isSorted(baseArray) ? baseArray.map((_, index) => index) : [],
      });
      setDragIndex(null);
      setHoverIndex(null);
    }
  }

  function generate() {
    const next = datasetArray(settings.defaultDataset, algorithm.slug === "bogo-sort" ? 6 : isManualSort ? 10 : 12);
    setBaseArray(next);
    setInput(next.join(", "));
  }

  function applyInput() {
    const parsed = parseArrayInput(input);
    if (parsed.length > 1) {
      setBaseArray(parsed);
    }
  }

  function flashExportStatus(status: "png" | "share" | "gif") {
    setExportStatus(status);
    window.setTimeout(() => setExportStatus("idle"), 1200);
  }

  function exportPayload() {
    return {
      algorithm,
      result: sortedResult,
      currentArray: activeStep.array,
      steps,
    };
  }

  function handleExportPng() {
    exportPng(exportPayload());
    flashExportStatus("png");
  }

  function handleExportShareCard() {
    exportShareCard(exportPayload());
    flashExportStatus("share");
  }

  async function handleExportGif() {
    setIsGifExporting(true);
    try {
      await exportGif(exportPayload());
      flashExportStatus("gif");
    } finally {
      setIsGifExporting(false);
    }
  }

  function handleScrub(nextIndex: number) {
    timerRef.current = 0;
    setStepIndex(nextIndex);
    setIsRunning(false);
    setIsPaused(false);
    stopAnimation();
  }

  function handleProgressPointer(clientX: number, bounds: DOMRect) {
    const ratio = Math.min(1, Math.max(0, (clientX - bounds.left) / Math.max(bounds.width, 1)));
    const maxIndex = Math.max(steps.length - 1, 0);
    const index = Math.round(ratio * maxIndex);
    const x = ratio * bounds.width;

    setScrubHover({ index, x });
    return index;
  }

  function handleManualDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setHoverIndex(null);
      return;
    }

    const nextArray = moveItem(manualArray, dragIndex, targetIndex);
    const nextStep: Step = {
      array: nextArray,
      action: isSorted(nextArray) ? "sorted" : "swap",
      indices: [dragIndex, targetIndex],
    };

    setManualArray(nextArray);
    setManualStep(nextStep);
    setDragIndex(null);
    setHoverIndex(null);

    if (soundEnabled) {
      audioRef.current ??= createAudioContext();
      void resumeAudioContext(audioRef.current).then(() => {
        playStepSound(audioRef.current, nextStep, Math.max(...nextArray.map((value) => Math.max(value, 0)), 1), volume, speed);
      });
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-lg border border-zinc-950/10 bg-white/72 p-4 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/8 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{t("visualizer.title")}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              {isRandomizedRun
                ? `${t(`visualizer.actions.${activeStep.action}`)} · ${t("visualizer.randomizedRun")}`
                : `${t(`visualizer.actions.${activeStep.action}`)} · ${t("visualizer.step")} ${Math.min(stepIndex + 1, steps.length)} ${t("visualizer.of")} ${steps.length}`}
            </p>
          </div>
          <span
            className={`rounded-lg px-3 py-1 text-sm font-semibold text-zinc-950 ${actionColors[activeStep.action]}`}
          >
            {t(`visualizer.actions.${activeStep.action}`)}
          </span>
        </div>

        {isRandomizedRun ? (
          <div className="mt-5 rounded-lg border border-dashed border-zinc-950/10 bg-zinc-950/[0.03] px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
            {t("visualizer.randomizedHint")}
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <span>{t("visualizer.progress")}</span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
            <div
              className="relative mt-2 h-2 overflow-visible rounded-lg bg-zinc-200 dark:bg-zinc-800"
              role="progressbar"
              aria-label="Sorting progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              onMouseLeave={() => setScrubHover(null)}
              onMouseMove={(event) => {
                if (isManualSort) {
                  return;
                }
                handleProgressPointer(event.clientX, event.currentTarget.getBoundingClientRect());
              }}
              onClick={(event) => {
                if (isManualSort) {
                  return;
                }
                const index = handleProgressPointer(event.clientX, event.currentTarget.getBoundingClientRect());
                handleScrub(index);
              }}
            >
              <div
                className="h-full rounded-lg bg-teal-500 transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
              {!isManualSort && scrubHover ? (
                <div
                  className="pointer-events-none absolute bottom-4 -translate-x-1/2 rounded-lg bg-zinc-950 px-2 py-1 text-[11px] font-semibold text-white shadow-lg dark:bg-white dark:text-zinc-950"
                  style={{ left: scrubHover.x }}
                >
                  {t("visualizer.step")} {Math.min(scrubHover.index + 1, steps.length)}
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="mt-8 flex h-80 items-stretch gap-2 overflow-hidden rounded-lg border border-zinc-950/10 bg-zinc-100/80 p-4 dark:border-white/10 dark:bg-zinc-900">
          {activeStep.array.map((value, index) => {
            const isActive = activeStep.indices?.includes(index);
            const isSorted = activeStep.action === "sorted";
            const height = `${(Math.max(value, 0) / maxValue) * 100}%`;
            const isHoverTarget = isManualSort && hoverIndex === index;
            const color = isSorted
              ? "bg-emerald-400 animate-sorted"
              : isActive && activeStep.action === "compare"
                ? "bg-amber-400"
                : isActive && (activeStep.action === "swap" || activeStep.action === "delete")
                  ? "bg-rose-500"
                  : isActive && activeStep.action === "overwrite"
                    ? "bg-sky-500"
                  : "bg-zinc-400 dark:bg-zinc-600";

            return (
              <div
                key={`${algorithm.slug}-${index}`}
                className={`flex h-full min-w-0 flex-1 flex-col items-center gap-2 ${isManualSort ? "cursor-grab" : ""}`}
                draggable={isManualSort}
                onDragStart={() => {
                  setDragIndex(index);
                  setHoverIndex(index);
                }}
                onDragOver={(event) => {
                  if (!isManualSort) {
                    return;
                  }
                  event.preventDefault();
                  setHoverIndex(index);
                }}
                onDrop={(event) => {
                  if (!isManualSort) {
                    return;
                  }
                  event.preventDefault();
                  handleManualDrop(index);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setHoverIndex(null);
                }}
              >
                <div className="flex min-h-0 w-full flex-1 items-end">
                  <div
                    className={`min-h-px w-full rounded-t-lg transition-all duration-300 ease-out ${color} ${isHoverTarget ? "ring-2 ring-teal-500/60 ring-offset-2 ring-offset-zinc-100 dark:ring-offset-zinc-900" : ""}`}
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
        {isManualSort ? (
          <div className="mt-4 rounded-lg border border-teal-500/20 bg-teal-50 p-4 text-sm leading-6 text-teal-950 dark:border-teal-300/20 dark:bg-teal-300/10 dark:text-teal-100">
            <p className="font-semibold">{t("visualizer.manualTitle")}</p>
            <p className="mt-1">{t("visualizer.manualDescription")}</p>
          </div>
        ) : null}
        <div className="group mt-4 rounded-lg border border-zinc-950/10 bg-white/72 p-3 transition hover:bg-white focus-within:bg-white dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/10 dark:focus-within:bg-white/10">
          <button
            type="button"
            className="flex w-full cursor-default items-center justify-between gap-3 rounded-lg px-2 py-1 text-left text-sm font-semibold text-zinc-700 dark:text-zinc-200"
            aria-describedby="sorted-result"
          >
            <span>{isFinished ? t("visualizer.sortedResult") : t("visualizer.targetResult")}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("visualizer.hoverToShow")}</span>
          </button>
          <code
            id="sorted-result"
            className="mt-0 block max-h-0 overflow-x-auto overflow-y-hidden rounded-lg bg-zinc-950 px-3 py-0 text-sm text-teal-200 opacity-0 transition-all duration-200 group-hover:mt-3 group-hover:max-h-24 group-hover:py-2 group-hover:opacity-100 group-focus-within:mt-3 group-focus-within:max-h-24 group-focus-within:py-2 group-focus-within:opacity-100 dark:bg-black"
          >
            {sortedResult.join(" ")}
          </code>
        </div>
        </div>

        <aside className="rounded-lg border border-zinc-950/10 bg-white/72 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
          <h2 className="text-lg font-semibold tracking-tight">{t("controls.title")}</h2>
          <div className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={generate}
                disabled={isRunning}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-white dark:text-zinc-950"
              >
              <Shuffle size={16} />
              {t("controls.random")}
            </button>
            <div>
              <label htmlFor="array-input" className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                {t("controls.customInput")}
              </label>
              <textarea
                id="array-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={isRunning}
                rows={3}
                className="mt-2 w-full resize-none rounded-lg border border-zinc-950/10 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:opacity-45 dark:border-white/10 dark:bg-zinc-900"
              />
              <button
                type="button"
                onClick={applyInput}
                disabled={isRunning}
                className="mt-2 w-full rounded-lg border border-zinc-950/10 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
              >
                {t("controls.apply")}
              </button>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="speed" className="font-medium text-zinc-600 dark:text-zinc-300">
                  {t("controls.speed")}
                </label>
                <span className="font-mono">{speed.toFixed(1)}x</span>
              </div>
              <input
                id="speed"
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={speed}
                onChange={(event) => setSpeed(Number(event.target.value))}
                disabled={isManualSort}
                className="mt-3 w-full accent-teal-500 disabled:opacity-45"
              />
            </div>
            <div className="rounded-lg border border-zinc-950/10 p-3 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="volume" className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  {t("controls.sound")}
                </label>
                <button
                  type="button"
                  onClick={() => setSoundEnabled((enabled) => !enabled)}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 px-3 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
                  aria-pressed={soundEnabled}
                >
                  {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  {soundEnabled ? t("controls.on") : t("controls.off")}
                </button>
              </div>
              <input
                id="volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                disabled={!soundEnabled}
                className="mt-3 w-full accent-teal-500 disabled:opacity-45"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={start}
                disabled={isRunning || isManualSort}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-500 px-3 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Play size={15} />
                {t("controls.start")}
              </button>
              <button
                type="button"
                onClick={pause}
                disabled={!isRunning || isManualSort}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-950/10 px-3 py-3 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
              >
                <Pause size={15} />
                {t("controls.pause")}
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-950/10 px-3 py-3 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
              >
                <RotateCcw size={15} />
                {t("controls.reset")}
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div className="rounded-lg border border-zinc-950/10 bg-white/72 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">{t("export.title")}</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{t("export.hint")}</p>
          </div>
          {exportStatus !== "idle" ? (
            <span className="inline-flex items-center gap-1 self-start rounded-lg bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-900 dark:bg-teal-300/15 dark:text-teal-200">
              <Check size={13} />
              {t("export.exported")}
            </span>
          ) : null}
        </div>
        <div className="mt-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {(["images", "animation", "embed"] as const).map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setExportSection(section)}
                className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                  exportSection === section
                    ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                    : "border-zinc-950/10 bg-white/60 text-zinc-700 hover:bg-white dark:border-white/10 dark:bg-white/6 dark:text-zinc-300 dark:hover:bg-white/10"
                }`}
              >
                {t(`export.sections.${section}`)}
              </button>
            ))}
          </div>

          <div className="mt-3 rounded-lg border border-zinc-950/10 p-4 dark:border-white/10">
            {exportSection === "images" ? (
              <div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleExportPng}
                    disabled={isRunning}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-950/10 px-3 py-3 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
                  >
                    <Image size={15} />
                    {t("export.png")}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportShareCard}
                    disabled={isRunning}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-950/10 px-3 py-3 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
                  >
                    <Share2 size={15} />
                    {t("export.share")}
                  </button>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:grid-cols-2">
                  <p>{t("export.hints.png")}</p>
                  <p>{t("export.hints.share")}</p>
                </div>
              </div>
            ) : null}

            {exportSection === "animation" ? (
              <div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleExportGif}
                    disabled={isRunning || isGifExporting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-950/10 px-3 py-3 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
                  >
                    {isGifExporting ? <Download size={15} className="animate-pulse" /> : <Film size={15} />}
                    {isGifExporting ? t("export.buildingGif") : t("export.gif")}
                  </button>
                  <button
                    type="button"
                    disabled
                    title={t("export.videoSoon")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-950/10 px-3 py-3 text-sm font-semibold opacity-45 dark:border-white/10"
                  >
                    <Film size={15} />
                    {t("export.video")}
                  </button>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:grid-cols-2">
                  <p>{t("export.hints.gif")}</p>
                  <p>{t("export.hints.video")}</p>
                </div>
              </div>
            ) : null}

            {exportSection === "embed" ? (
              <div>
                <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">{t("export.hints.html")}</p>
                <EmbedShare algorithm={algorithm} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <ExportCard algorithm={algorithm} result={sortedResult} />
    </section>
  );
}
