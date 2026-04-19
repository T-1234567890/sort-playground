import type { Step } from "../../core/types";

function isSorted(array: number[]) {
  return array.every((value, index) => index === 0 || array[index - 1] <= value);
}

function randomShuffle(array: number[]) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
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
    array = randomShuffle(array);
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
