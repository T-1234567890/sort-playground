import type { Step } from "./types";

export const DEFAULT_ARRAY = [42, 18, 73, 9, 55, 31, 88, 64, 27, 50];
export type DatasetPreset = "random" | "nearly-sorted" | "reverse";

export function randomArray(size = 12) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 88) + 12);
}

export function nearlySortedArray(size = 12) {
  const values = randomArray(size).sort((left, right) => left - right);

  if (values.length > 3) {
    const swapIndex = Math.max(1, Math.floor(values.length / 3));
    [values[swapIndex], values[swapIndex + 1]] = [values[swapIndex + 1], values[swapIndex]];
  }

  return values;
}

export function reverseSortedArray(size = 12) {
  return randomArray(size).sort((left, right) => right - left);
}

export function datasetArray(preset: DatasetPreset, size = 12) {
  if (preset === "nearly-sorted") {
    return nearlySortedArray(size);
  }

  if (preset === "reverse") {
    return reverseSortedArray(size);
  }

  return randomArray(size);
}

export function parseArrayInput(value: string) {
  return value
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number)
    .filter((item) => Number.isFinite(item))
    .slice(0, 24);
}

export function sortAscending(array: number[]) {
  return [...array].sort((a, b) => a - b);
}

export function sortedStep(array: number[]): Step {
  return {
    array: sortAscending(array),
    action: "sorted",
    indices: array.map((_, index) => index),
  };
}
