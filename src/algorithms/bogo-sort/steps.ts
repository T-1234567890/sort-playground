import type { Step } from "../../core/types";

function isSorted(array: number[]) {
  return array.every((value, index) => index === 0 || array[index - 1] <= value);
}

function seededShuffle(array: number[], seed: number) {
  const copy = [...array];
  let state = seed * 9301 + 49297;

  for (let i = copy.length - 1; i > 0; i -= 1) {
    state = (state * 233280 + 49297) % 2147483647;
    const j = state % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function bogoSortSteps(input: number[]): Step[] {
  let array = input.slice(0, 7);
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];
  let attempts = 0;

  while (!isSorted(array) && attempts < 20) {
    steps.push({ array: [...array], action: "compare", indices: array.map((_, index) => index) });
    array = seededShuffle(array, attempts + array.length);
    steps.push({ array: [...array], action: "swap", indices: array.map((_, index) => index) });
    attempts += 1;
  }

  if (!isSorted(array)) {
    array = [...array].sort((a, b) => a - b);
    steps.push({ array: [...array], action: "swap", indices: array.map((_, index) => index) });
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
