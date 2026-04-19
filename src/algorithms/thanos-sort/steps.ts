import type { Step } from "../../core/types";

function isSorted(values: number[]) {
  return values.every((value, index) => index === 0 || values[index - 1] <= value);
}

export function thanosSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  while (array.length > 1 && !isSorted(array)) {
    for (let index = 1; index < array.length; index += 1) {
      steps.push({ array: [...array], action: "compare", indices: [index - 1, index] });
    }

    const keep = array.filter((_, index) => index % 2 === 0);
    const removed = array.filter((_, index) => index % 2 === 1);
    array.splice(0, array.length, ...keep);

    for (let index = 0; index < removed.length; index += 1) {
      steps.push({ array: [...array], action: "delete", indices: [Math.min(index, array.length)] });
    }
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
