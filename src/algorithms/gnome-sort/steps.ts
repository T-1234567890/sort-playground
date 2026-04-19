import type { Step } from "../../core/types";

export function gnomeSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];
  let index = 1;

  while (index < array.length) {
    steps.push({ array: [...array], action: "compare", indices: [index - 1, index] });
    if (array[index - 1] <= array[index]) {
      index += 1;
    } else {
      [array[index - 1], array[index]] = [array[index], array[index - 1]];
      steps.push({ array: [...array], action: "swap", indices: [index - 1, index] });
      index = Math.max(1, index - 1);
    }
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, itemIndex) => itemIndex) });
  return steps;
}
