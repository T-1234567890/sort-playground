import type { Step } from "./types";

export const DEFAULT_ARRAY = [42, 18, 73, 9, 55, 31, 88, 64, 27, 50];

export function randomArray(size = 12) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 88) + 12);
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
