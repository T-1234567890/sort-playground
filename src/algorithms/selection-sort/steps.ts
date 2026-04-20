import type { Step } from "../../core/types";

export function selectionSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  function swap(left: number, right: number) {
    [array[left], array[right]] = [array[right], array[left]];
    steps.push({ array: [...array], action: "swap", indices: [left, right] });
  }

  for (let start = 0; start < array.length - 1; start += 1) {
    let minIndex = start;

    for (let index = start + 1; index < array.length; index += 1) {
      steps.push({ array: [...array], action: "compare", indices: [minIndex, index] });
      if (array[index] < array[minIndex]) {
        minIndex = index;
      }
    }

    if (minIndex !== start) {
      swap(start, minIndex);
    }
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
