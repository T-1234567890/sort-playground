import type { Step } from "../../core/types";

function isSorted(array: number[]) {
  return array.every((value, index) => index === 0 || array[index - 1] <= value);
}

export function miracleSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  for (let attempt = 0; attempt < 6 && !isSorted(array); attempt += 1) {
    steps.push({ array: [...array], action: "compare", indices: array.map((_, index) => index) });
  }

  if (isSorted(array)) {
    steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  }

  return steps;
}
