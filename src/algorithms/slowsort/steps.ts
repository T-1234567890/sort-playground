import type { Step } from "../../core/types";

export function slowsortSteps(input: number[]): Step[] {
  const array = input.slice(0, 8);
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  function sort(left: number, right: number) {
    if (left >= right) {
      return;
    }

    const middle = Math.floor((left + right) / 2);
    sort(left, middle);
    sort(middle + 1, right);

    steps.push({ array: [...array], action: "compare", indices: [middle, right] });
    if (array[middle] > array[right]) {
      [array[middle], array[right]] = [array[right], array[middle]];
      steps.push({ array: [...array], action: "swap", indices: [middle, right] });
    }

    sort(left, right - 1);
  }

  sort(0, array.length - 1);
  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
