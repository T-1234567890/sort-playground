import { ArrowLeft, Pause, Play, RotateCcw, Shuffle, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import { SortRunCard } from "../components/SortRunCard";
import { createAudioContext, playStepSound, resumeAudioContext, type SortAudioContext } from "../core/sound";
import { datasetArray, parseArrayInput } from "../core/visualizer";
import { useSettings } from "../hooks/useSettings";
import type { Algorithm } from "../core/types";

type RacePageProps = {
  algorithms: Algorithm[];
  dark: boolean;
  onToggleDark: () => void;
};

const defaultRaceSlugs = ["quick-sort", "merge-sort"];

function formatSeconds(seconds: number) {
  return `${seconds.toFixed(seconds < 10 ? 2 : 1)}s`;
}

function selectedFromUrl(algorithms: Algorithm[]) {
  const params = new URLSearchParams(window.location.search);
  const requested = (params.get("algorithms") ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
  const selected = requested
    .map((slug) => algorithms.find((algorithm) => algorithm.slug === slug))
    .filter((algorithm): algorithm is Algorithm => Boolean(algorithm))
    .slice(0, 8)
    .map((algorithm) => algorithm.slug);

  if (selected.length >= 2) {
    return selected;
  }

  const available = new Set(algorithms.map((algorithm) => algorithm.slug));
  const defaults = defaultRaceSlugs.filter((slug) => available.has(slug));
  return defaults.length === 2 ? defaults : algorithms.slice(0, 2).map((algorithm) => algorithm.slug);
}

export function RacePage({ algorithms, dark, onToggleDark }: RacePageProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [selectedSlugs] = useState(() => selectedFromUrl(algorithms));
  const initialArray = useMemo(() => datasetArray(settings.defaultDataset, 10), [settings.defaultDataset]);
  const [baseArray, setBaseArray] = useState(initialArray);
  const [input, setInput] = useState(initialArray.join(", "));
  const [speed, setSpeed] = useState(4);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef(0);
  const audioRef = useRef<SortAudioContext | null>(null);

  const selectedAlgorithms = useMemo(
    () => selectedSlugs.map((slug) => algorithms.find((algorithm) => algorithm.slug === slug)).filter((algorithm): algorithm is Algorithm => Boolean(algorithm)),
    [algorithms, selectedSlugs],
  );
  const raceRuns = useMemo(
    () => selectedAlgorithms.map((algorithm) => ({ algorithm, steps: algorithm.steps(baseArray) })),
    [baseArray, selectedAlgorithms],
  );
  const maxSteps = Math.max(...raceRuns.map((run) => run.steps.length), 1);
  const isFinished = stepIndex >= maxSteps - 1;
  const maxValue = Math.max(...baseArray.map((value) => Math.max(value, 0)), 1);
  const stepDelaySeconds = 0.7 / speed;
  const raceEndStep = Math.max(maxSteps - 1, 1);
  const elapsedSeconds = Math.min(stepIndex, raceEndStep) * stepDelaySeconds;
  const raceEndSeconds = raceEndStep * stepDelaySeconds;
  const rankings = useMemo(() => {
    return new Map(
      [...raceRuns]
        .sort((a, b) => a.steps.length - b.steps.length || a.algorithm.name.localeCompare(b.algorithm.name))
        .map((run, index) => [run.algorithm.slug, index + 1]),
    );
  }, [raceRuns]);
  const leader = useMemo(() => {
    return [...raceRuns].sort((a, b) => {
      const aProgress = Math.min(stepIndex, a.steps.length - 1) / Math.max(a.steps.length - 1, 1);
      const bProgress = Math.min(stepIndex, b.steps.length - 1) / Math.max(b.steps.length - 1, 1);
      return bProgress - aProgress || a.steps.length - b.steps.length || a.algorithm.name.localeCompare(b.algorithm.name);
    })[0]?.algorithm;
  }, [raceRuns, stepIndex]);

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
  }, [baseArray, selectedSlugs, stopAnimation]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const delay = 700 / speed;
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

    const mixedVolume = volume / Math.sqrt(Math.max(raceRuns.length, 1));
    raceRuns.forEach((run) => {
      const step = run.steps[Math.min(stepIndex, run.steps.length - 1)];
      if (step) {
        playStepSound(audioRef.current, step, maxValue, mixedVolume, speed);
      }
    });
  }, [isRunning, maxValue, raceRuns, soundEnabled, speed, stepIndex, volume]);

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
      setBaseArray(parsed.slice(0, 14));
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
          <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">{t("race.eyebrow")}</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight">{t("race.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">{t("race.description")}</p>
        </section>

        <section className="mt-8 rounded-lg border border-zinc-950/10 bg-white/72 p-4 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
          <div className="grid gap-3 sm:grid-cols-2">
            {selectedAlgorithms.map((algorithm) => (
              <div key={algorithm.slug} className="rounded-lg bg-zinc-950/5 p-3 dark:bg-white/10">
                <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">{algorithm.category}</p>
                <p className="mt-1 text-lg font-semibold">{algorithm.name}</p>
                <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">{algorithm.complexity}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <label htmlFor="race-array" className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">{t("controls.customInput")}</label>
              <div className="mt-2 flex gap-2">
                <input
                  id="race-array"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={isRunning}
                  className="min-w-0 flex-1 rounded-lg border border-zinc-950/10 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-zinc-900"
                />
                <button type="button" onClick={applyInput} disabled={isRunning} className="rounded-lg border border-zinc-950/10 px-3 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white disabled:opacity-45 dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950">
                  {t("controls.apply")}
                </button>
              </div>
            </div>
            <label htmlFor="race-speed" className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              {t("race.speedBoost")} <span className="font-mono">{speed.toFixed(1)}x</span>
              <input id="race-speed" type="range" min="1" max="10" step="0.5" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="mt-3 w-full accent-teal-500" />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
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
            <a data-route href="/allalgo" className="inline-flex items-center rounded-lg border border-zinc-950/10 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950">
              {t("race.changeRacers")}
            </a>
            <button
              type="button"
              onClick={() => setSoundEnabled((enabled) => !enabled)}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              {soundEnabled ? t("controls.on") : t("controls.off")}
            </button>
            <label htmlFor="race-volume" className="inline-flex min-w-40 items-center gap-2 rounded-lg border border-zinc-950/10 px-3 py-2 text-sm font-semibold dark:border-white/10">
              {t("controls.sound")}
              <input
                id="race-volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="w-20 accent-teal-500"
              />
            </label>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-zinc-950/10 bg-white/72 p-4 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/8 sm:p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">{t("race.timeline")}</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{t("race.timerBar")}</h2>
            </div>
            <div className="grid gap-1 text-sm text-zinc-600 dark:text-zinc-300 sm:text-right">
              <span>
                {t("race.elapsed")} <span className="font-mono font-semibold">{formatSeconds(elapsedSeconds)}</span>
              </span>
              <span>
                {t("race.leader")} <span className="font-semibold">{leader?.name ?? "-"}</span>
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-zinc-100/80 p-3 ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 sm:p-4">
            <div className="space-y-3">
            {raceRuns.map((run) => {
              const finishStep = Math.max(run.steps.length - 1, 0);
              const currentPercent = (Math.min(stepIndex, finishStep) / raceEndStep) * 100;
              const done = stepIndex >= finishStep;
              const finishSeconds = finishStep * stepDelaySeconds;
              const rank = rankings.get(run.algorithm.slug);
              const resultText = `#${rank ?? "-"} · ${t("race.completeAt")} ${formatSeconds(finishSeconds)}`;

              return (
                <div
                  key={run.algorithm.slug}
                  tabIndex={0}
                  className="group grid gap-3 rounded-lg bg-white/72 p-3 ring-1 ring-zinc-950/10 outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-teal-500 dark:bg-white/8 dark:ring-white/10 dark:hover:bg-white/10 lg:grid-cols-[minmax(120px,180px)_minmax(0,1fr)] lg:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        done ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-300 dark:text-zinc-950" : "bg-teal-100 text-teal-900 dark:bg-teal-300 dark:text-zinc-950"
                      }`}>
                        {run.algorithm.name.slice(0, 1)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-950 dark:text-white">{run.algorithm.name}</p>
                        <p className="mt-0.5 truncate text-[11px] uppercase text-zinc-500 dark:text-zinc-400">{run.algorithm.category}</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between gap-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      <span>{done ? t("race.complete") : t("race.running")}</span>
                      <span className="opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">{resultText}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className={`h-full rounded-lg transition-[width] duration-300 ${done ? "bg-emerald-400" : "bg-teal-500"}`}
                        style={{ width: `${currentPercent}%` }}
                      />
                    </div>
                    <div className="mt-2 max-h-0 overflow-hidden text-xs font-semibold text-zinc-600 opacity-0 transition-all group-hover:max-h-10 group-hover:opacity-100 group-focus:max-h-10 group-focus:opacity-100 dark:text-zinc-300">
                      {run.algorithm.name} · {resultText}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-zinc-100/80 p-4 ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <span>0.00s</span>
              <span>
                {t("race.raceEnd")} {formatSeconds(raceEndSeconds)}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-lg bg-teal-500 transition-[width] duration-300"
                style={{ width: `${(Math.min(stepIndex, raceEndStep) / raceEndStep) * 100}%` }}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {raceRuns.map((run) => (
            <SortRunCard
              key={run.algorithm.slug}
              algorithm={run.algorithm}
              steps={run.steps}
              stepIndex={stepIndex}
              rank={stepIndex >= run.steps.length - 1 ? rankings.get(run.algorithm.slug) : undefined}
              compact
            />
          ))}
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
