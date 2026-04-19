import type { Step } from "../../core/types";

export function stoogeSortSteps(input: number[]): Step[] {
  const array = input.slice(0, 9);
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  function sort(left: number, right: number) {
    if (left >= right) {
      return;
    }

    steps.push({ array: [...array], action: "compare", indices: [left, right] });
    if (array[left] > array[right]) {
      [array[left], array[right]] = [array[right], array[left]];
      steps.push({ array: [...array], action: "swap", indices: [left, right] });
    }

    if (right - left + 1 > 2) {
      const third = Math.floor((right - left + 1) / 3);
      sort(left, right - third);
      sort(left + third, right);
      sort(left, right - third);
    }
  }

  sort(0, array.length - 1);
  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
