import type { Step } from "../../core/types";

export function mergeSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  function merge(left: number, middle: number, right: number) {
    const leftPart = array.slice(left, middle + 1);
    const rightPart = array.slice(middle + 1, right + 1);
    let i = 0;
    let j = 0;
    let write = left;

    while (i < leftPart.length && j < rightPart.length) {
      steps.push({ array: [...array], action: "compare", indices: [left + i, middle + 1 + j] });
      if (leftPart[i] <= rightPart[j]) {
        array[write] = leftPart[i];
        i += 1;
      } else {
        array[write] = rightPart[j];
        j += 1;
      }
      steps.push({ array: [...array], action: "swap", indices: [write] });
      write += 1;
    }

    while (i < leftPart.length) {
      array[write] = leftPart[i];
      steps.push({ array: [...array], action: "swap", indices: [write] });
      i += 1;
      write += 1;
    }

    while (j < rightPart.length) {
      array[write] = rightPart[j];
      steps.push({ array: [...array], action: "swap", indices: [write] });
      j += 1;
      write += 1;
    }
  }

  function sort(left: number, right: number) {
    if (left >= right) {
      return;
    }

    const middle = Math.floor((left + right) / 2);
    sort(left, middle);
    sort(middle + 1, right);
    merge(left, middle, right);
  }

  sort(0, array.length - 1);
  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });

  return steps;
}
