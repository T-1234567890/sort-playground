import type { Step } from "../../core/types";

const SHRINK_FACTOR = 1.3;

export function combSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  function swap(left: number, right: number) {
    [array[left], array[right]] = [array[right], array[left]];
    steps.push({ array: [...array], action: "swap", indices: [left, right] });
  }

  let gap = array.length;
  let swapped = true;

  while (gap > 1 || swapped) {
    gap = Math.max(1, Math.floor(gap / SHRINK_FACTOR));
    swapped = false;

    for (let index = 0; index + gap < array.length; index += 1) {
      steps.push({ array: [...array], action: "compare", indices: [index, index + gap] });
      if (array[index] > array[index + gap]) {
        swap(index, index + gap);
        swapped = true;
      }
    }
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
