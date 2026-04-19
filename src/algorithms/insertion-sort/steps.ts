import type { Step } from "../../core/types";

export function insertionSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  for (let i = 1; i < array.length; i += 1) {
    const key = array[i];
    let j = i - 1;

    steps.push({ array: [...array], action: "compare", indices: [j, i] });

    while (j >= 0 && array[j] > key) {
      steps.push({ array: [...array], action: "compare", indices: [j, j + 1] });
      array[j + 1] = array[j];
      steps.push({ array: [...array], action: "overwrite", indices: [j + 1] });
      j -= 1;
    }

    array[j + 1] = key;
    steps.push({ array: [...array], action: "overwrite", indices: [j + 1] });
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
