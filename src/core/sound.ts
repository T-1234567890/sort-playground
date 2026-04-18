import type { Step } from "./types";

type BrowserWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export type SortAudioContext = AudioContext;

export function createAudioContext() {
  const AudioContextClass = window.AudioContext ?? (window as BrowserWindow).webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  return new AudioContextClass();
}

export async function resumeAudioContext(context: SortAudioContext | null) {
  if (context?.state === "suspended") {
    await context.resume();
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function frequencyForValue(value: number, maxValue: number) {
  const normalized = clamp(value / Math.max(maxValue, 1), 0, 1);
  return 180 + normalized * 760;
}

function playTone(
  context: SortAudioContext,
  frequency: number,
  startOffset: number,
  duration: number,
  volume: number,
  type: OscillatorType,
) {
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = now + startOffset;
  const end = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.012);
}

export function playStepSound(context: SortAudioContext | null, step: Step, maxValue: number, volume: number, speed: number) {
  if (!context || volume <= 0) {
    return;
  }

  const duration = clamp(0.06 / Math.sqrt(speed), 0.026, 0.08);
  const baseVolume = clamp(volume, 0, 1) * 0.08;

  if (step.action === "sorted") {
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      playTone(context, frequency, index * 0.055, 0.09, baseVolume * 0.9, "sine");
    });
    return;
  }

  const values = (step.indices?.length ? step.indices : [0])
    .slice(0, 3)
    .map((index) => step.array[index])
    .filter((value): value is number => typeof value === "number");

  const waveform: OscillatorType = step.action === "compare" ? "sine" : step.action === "swap" ? "square" : "sawtooth";
  const actionVolume = step.action === "compare" ? baseVolume : baseVolume * 1.25;

  values.forEach((value, index) => {
    playTone(context, frequencyForValue(value, maxValue), index * 0.026, duration, actionVolume, waveform);
  });
}
