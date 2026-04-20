import type { Step } from "../../core/types";

export function shellSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  for (let gap = Math.floor(array.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < array.length; i += 1) {
      const value = array[i];
      let j = i;

      while (j >= gap) {
        steps.push({ array: [...array], action: "compare", indices: [j - gap, j] });
        if (array[j - gap] <= value) {
          break;
        }

        array[j] = array[j - gap];
        steps.push({ array: [...array], action: "overwrite", indices: [j] });
        j -= gap;
      }

      array[j] = value;
      steps.push({ array: [...array], action: "overwrite", indices: [j] });
    }
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
