import type { Step } from "../../core/types";

export function bubbleSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  for (let end = array.length - 1; end > 0; end -= 1) {
    for (let i = 0; i < end; i += 1) {
      steps.push({ array: [...array], action: "compare", indices: [i, i + 1] });
      if (array[i] > array[i + 1]) {
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
        steps.push({ array: [...array], action: "swap", indices: [i, i + 1] });
      }
    }
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
