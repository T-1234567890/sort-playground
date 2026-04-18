import type { Step } from "../../core/types";

export function stalinSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];
  let index = 1;

  while (index < array.length) {
    steps.push({ array: [...array], action: "compare", indices: [index - 1, index] });
    if (array[index] < array[index - 1]) {
      array.splice(index, 1);
      steps.push({ array: [...array], action: "delete", indices: [index] });
    } else {
      index += 1;
    }
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, itemIndex) => itemIndex) });
  return steps;
}
