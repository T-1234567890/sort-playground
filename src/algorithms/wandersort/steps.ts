import type { Step } from "../../core/types";

function isSorted(array: number[]) {
  return array.every((value, index) => index === 0 || array[index - 1] <= value);
}

function nextRandom(seed: number) {
  return (seed * 1664525 + 1013904223) >>> 0;
}

export function wandersortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];
  let seed = array.reduce((sum, value, index) => sum + Math.trunc(value) * (index + 17), 2166136261) >>> 0;
  const maxAttempts = Math.max(2000, array.length * array.length * 240);
  let attempts = 0;

  while (!isSorted(array) && attempts < maxAttempts) {
    seed = nextRandom(seed);
    let left = seed % array.length;
    seed = nextRandom(seed);
    let right = seed % array.length;

    if (left === right) {
      attempts += 1;
      continue;
    }

    if (left > right) {
      [left, right] = [right, left];
    }

    steps.push({ array: [...array], action: "compare", indices: [left, right] });

    if (array[left] > array[right]) {
      [array[left], array[right]] = [array[right], array[left]];
      steps.push({ array: [...array], action: "swap", indices: [left, right] });
    }

    attempts += 1;
  }

  if (!isSorted(array)) {
    array.sort((left, right) => left - right);
    steps.push({ array: [...array], action: "overwrite", indices: array.map((_, index) => index) });
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
