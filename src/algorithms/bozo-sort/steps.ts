import type { Step } from "../../core/types";

function isSorted(array: number[]) {
  return array.every((value, index) => index === 0 || array[index - 1] <= value);
}

export function bozoSortSteps(input: number[]): Step[] {
  const array = input.slice(0, 7);
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];
  let attempts = 0;

  while (!isSorted(array) && attempts < 40) {
    const i = Math.floor(Math.random() * array.length);
    const j = Math.floor(Math.random() * array.length);

    steps.push({ array: [...array], action: "compare", indices: [i, j] });
    if (i !== j) {
      [array[i], array[j]] = [array[j], array[i]];
      steps.push({ array: [...array], action: "swap", indices: [i, j] });
    }
    attempts += 1;
  }

  if (!isSorted(array)) {
    const sorted = [...array].sort((a, b) => a - b);
    sorted.forEach((value, index) => {
      array[index] = value;
      steps.push({ array: [...array], action: "overwrite", indices: [index] });
    });
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
