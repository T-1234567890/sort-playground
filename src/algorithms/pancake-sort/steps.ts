import type { Step } from "../../core/types";

function reversePrefix(array: number[], end: number) {
  for (let left = 0, right = end; left < right; left += 1, right -= 1) {
    [array[left], array[right]] = [array[right], array[left]];
  }
}

export function pancakeSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  for (let size = array.length; size > 1; size -= 1) {
    let maxIndex = 0;

    for (let i = 1; i < size; i += 1) {
      steps.push({ array: [...array], action: "compare", indices: [maxIndex, i] });
      if (array[i] > array[maxIndex]) {
        maxIndex = i;
      }
    }

    if (maxIndex === size - 1) {
      continue;
    }

    if (maxIndex > 0) {
      reversePrefix(array, maxIndex);
      steps.push({ array: [...array], action: "swap", indices: Array.from({ length: maxIndex + 1 }, (_, index) => index) });
    }

    reversePrefix(array, size - 1);
    steps.push({ array: [...array], action: "swap", indices: Array.from({ length: size }, (_, index) => index) });
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
