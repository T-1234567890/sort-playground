import { ArrowLeft, Pause, Play, RotateCcw, Shuffle, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import { SortRunCard } from "../components/SortRunCard";
import { createAudioContext, playStepSound, resumeAudioContext, type SortAudioContext } from "../core/sound";
import { datasetArray, parseArrayInput } from "../core/visualizer";
import { useSettings } from "../hooks/useSettings";
import type { Algorithm, StepAction } from "../core/types";

type ComparePageProps = {
  algorithms: Algorithm[];
  dark: boolean;
  onToggleDark: () => void;
};

function findDefault(algorithms: Algorithm[], slug: string, fallbackIndex: number) {
  return algorithms.find((algorithm) => algorithm.slug === slug)?.slug ?? algorithms[fallbackIndex]?.slug ?? algorithms[0]?.slug ?? "";
}

function selectedFromUrl(algorithms: Algorithm[]) {
  const params = new URLSearchParams(window.location.search);
  return {
    left: algorithms.find((algorithm) => algorithm.slug === params.get("left"))?.slug ?? findDefault(algorithms, "quick-sort", 0),
    right: algorithms.find((algorithm) => algorithm.slug === params.get("right"))?.slug ?? findDefault(algorithms, "bubble-sort", 1),
  };
}

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

export function ComparePage({ algorithms, dark, onToggleDark }: ComparePageProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [leftSlug] = useState(() => selectedFromUrl(algorithms).left);
  const [rightSlug] = useState(() => selectedFromUrl(algorithms).right);
  const initialArray = useMemo(() => datasetArray(settings.defaultDataset, 10), [settings.defaultDataset]);
  const [baseArray, setBaseArray] = useState(initialArray);
  const [input, setInput] = useState(initialArray.join(", "));
  const [speed, setSpeed] = useState(1.5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef(0);
  const audioRef = useRef<SortAudioContext | null>(null);

  const leftAlgorithm = algorithms.find((algorithm) => algorithm.slug === leftSlug) ?? algorithms[0];
  const rightAlgorithm = algorithms.find((algorithm) => algorithm.slug === rightSlug) ?? algorithms[1] ?? algorithms[0];
  const leftSteps = useMemo(() => leftAlgorithm.steps(baseArray), [baseArray, leftAlgorithm]);
  const rightSteps = useMemo(() => rightAlgorithm.steps(baseArray), [baseArray, rightAlgorithm]);
  const leftCounts = useMemo(() => countActions(leftSteps), [leftSteps]);
  const rightCounts = useMemo(() => countActions(rightSteps), [rightSteps]);
  const maxSteps = Math.max(leftSteps.length, rightSteps.length, 1);
  const isFinished = stepIndex >= maxSteps - 1;
  const maxValue = Math.max(...baseArray.map((value) => Math.max(value, 0)), 1);
  const detailRows = [
    [t("algorithm.time"), leftAlgorithm.complexity, rightAlgorithm.complexity],
    [t("algorithm.space"), leftAlgorithm.spaceComplexity ?? "Unknown", rightAlgorithm.spaceComplexity ?? "Unknown"],
    [t("algorithm.stability"), leftAlgorithm.stability ?? "Unknown", rightAlgorithm.stability ?? "Unknown"],
    [t("algorithm.category"), leftAlgorithm.category, rightAlgorithm.category],
    [t("compare.visualization"), leftAlgorithm.visualization ?? "default", rightAlgorithm.visualization ?? "default"],
    [t("compare.steps"), leftSteps.length, rightSteps.length],
    [t("compare.compares"), leftCounts.compare, rightCounts.compare],
    [t("compare.swaps"), leftCounts.swap, rightCounts.swap],
    [t("compare.overwrites"), leftCounts.overwrite, rightCounts.overwrite],
    [t("compare.deletes"), leftCounts.delete, rightCounts.delete],
  ];

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
    timerRef.current = 0;
    setStepIndex(0);
    setIsRunning(false);
    stopAnimation();
  }, [baseArray, leftSlug, rightSlug, stopAnimation]);

  useEffect(() => {
    if (!isRunning) {
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
        setStepIndex((index) => Math.min(index + 1, maxSteps - 1));
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return stopAnimation;
  }, [isRunning, maxSteps, speed, stopAnimation]);

  useEffect(() => {
    if (isFinished) {
      setIsRunning(false);
    }
  }, [isFinished]);

  useEffect(() => {
    if (!isRunning || !soundEnabled || stepIndex === 0) {
      return;
    }

    const leftStep = leftSteps[Math.min(stepIndex, leftSteps.length - 1)];
    const rightStep = rightSteps[Math.min(stepIndex, rightSteps.length - 1)];

    if (leftStep) {
      playStepSound(audioRef.current, leftStep, maxValue, volume * 0.7, speed);
    }
    if (rightStep) {
      playStepSound(audioRef.current, rightStep, maxValue, volume * 0.7, speed);
    }
  }, [isRunning, leftSteps, maxValue, rightSteps, soundEnabled, speed, stepIndex, volume]);

  async function start() {
    if (isFinished) {
      setStepIndex(0);
    }

    if (soundEnabled) {
      audioRef.current ??= createAudioContext();
      await resumeAudioContext(audioRef.current);
    }

    timerRef.current = 0;
    setIsRunning(true);
  }

  function pause() {
    setIsRunning(false);
    stopAnimation();
  }

  function reset() {
    timerRef.current = 0;
    setStepIndex(0);
    setIsRunning(false);
    stopAnimation();
  }

  function generate() {
    const next = datasetArray(settings.defaultDataset, 10);
    setBaseArray(next);
    setInput(next.join(", "));
  }

  function applyInput() {
    const parsed = parseArrayInput(input);
    if (parsed.length > 1) {
      setBaseArray(parsed.slice(0, 16));
    }
  }

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

        <section className="mt-10">
          <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">{t("compare.eyebrow")}</p>
          <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-5xl font-semibold tracking-tight">{t("compare.title")}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">{t("compare.description")}</p>
            </div>
            <div className="rounded-lg bg-white/70 p-3 text-sm shadow-sm ring-1 ring-zinc-950/5 dark:bg-white/8 dark:ring-white/10">
              <span className="font-semibold">{t("compare.sharedInput")}</span>
              <span className="ml-2 font-mono text-zinc-500 dark:text-zinc-400">{baseArray.join(" ")}</span>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-4 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.4fr]">
            {[leftAlgorithm, rightAlgorithm].map((algorithm) => (
              <div key={algorithm.slug} className="rounded-lg bg-zinc-950/5 p-3 dark:bg-white/10">
                <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">{algorithm.category}</p>
                <p className="mt-1 text-lg font-semibold">{algorithm.name}</p>
                <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">{algorithm.complexity}</p>
              </div>
            ))}
            <div>
              <label htmlFor="compare-array" className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">{t("controls.customInput")}</label>
              <div className="mt-2 flex gap-2">
                <input
                  id="compare-array"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={isRunning}
                  className="min-w-0 flex-1 rounded-lg border border-zinc-950/10 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-zinc-900"
                />
                <button
                  type="button"
                  onClick={applyInput}
                  disabled={isRunning}
                  className="rounded-lg border border-zinc-950/10 px-3 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white disabled:opacity-45 dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
                >
                  {t("controls.apply")}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={generate} disabled={isRunning} className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white disabled:opacity-45 dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950">
                <Shuffle size={15} />
                {t("controls.random")}
              </button>
              <button type="button" onClick={start} disabled={isRunning} className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-teal-400 disabled:opacity-45">
                <Play size={15} />
                {t("controls.start")}
              </button>
              <button type="button" onClick={pause} disabled={!isRunning} className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white disabled:opacity-45 dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950">
                <Pause size={15} />
                {t("controls.pause")}
              </button>
              <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950">
                <RotateCcw size={15} />
                {t("controls.reset")}
              </button>
              <button
                type="button"
                onClick={() => setSoundEnabled((enabled) => !enabled)}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                {soundEnabled ? t("controls.on") : t("controls.off")}
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label htmlFor="compare-speed" className="min-w-52 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                {t("controls.speed")} <span className="font-mono">{speed.toFixed(1)}x</span>
                <input id="compare-speed" type="range" min="0.5" max="5" step="0.5" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="mt-2 w-full accent-teal-500" />
              </label>
              <label htmlFor="compare-volume" className="min-w-40 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                {t("controls.sound")} <span className="font-mono">{Math.round(volume * 100)}%</span>
                <input
                  id="compare-volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  className="mt-2 w-full accent-teal-500"
                />
              </label>
            </div>
          </div>
          <a data-route href="/allalgo" className="mt-4 inline-flex text-sm font-semibold text-teal-700 transition hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100">
            {t("compare.changeSelection")}
          </a>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <SortRunCard algorithm={leftAlgorithm} steps={leftSteps} stepIndex={stepIndex} />
          <SortRunCard algorithm={rightAlgorithm} steps={rightSteps} stepIndex={stepIndex} />
        </section>

        <section className="mt-6 overflow-hidden rounded-lg border border-zinc-950/10 bg-white/72 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-zinc-950/10 text-sm font-semibold dark:border-white/10">
            <div className="p-3">{t("compare.detail")}</div>
            <div className="p-3">{leftAlgorithm.name}</div>
            <div className="p-3">{rightAlgorithm.name}</div>
          </div>
          {detailRows.map(([label, left, right]) => (
            <div key={label} className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-zinc-950/5 text-sm last:border-b-0 dark:border-white/10">
              <div className="p-3 font-semibold text-zinc-500 dark:text-zinc-400">{label}</div>
              <div className="p-3 font-mono">{left}</div>
              <div className="p-3 font-mono">{right}</div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
