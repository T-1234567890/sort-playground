import type { Step } from "../../core/types";

function binaryInsert(sorted: number[], value: number) {
  let left = 0;
  let right = sorted.length;

  while (left < right) {
    const middle = Math.floor((left + right) / 2);
    if (sorted[middle] <= value) {
      left = middle + 1;
    } else {
      right = middle;
    }
  }

  sorted.splice(left, 0, value);
  return left;
}

export function librarySortSteps(input: number[]): Step[] {
  const array = [...input];
  const sorted: number[] = [];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  for (let index = 0; index < array.length; index += 1) {
    const position = binaryInsert(sorted, array[index]);
    const rebuilt = [...sorted];

    for (let writeIndex = 0; writeIndex < rebuilt.length; writeIndex += 1) {
      array[writeIndex] = rebuilt[writeIndex];
      steps.push({ array: [...array], action: "overwrite", indices: [writeIndex] });
    }

    steps.push({ array: [...array], action: "compare", indices: [Math.max(0, position - 1), Math.min(position, rebuilt.length - 1)] });
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
