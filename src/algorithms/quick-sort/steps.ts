import type { Step } from "../../core/types";

export function quickSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  function swap(i: number, j: number) {
    [array[i], array[j]] = [array[j], array[i]];
    steps.push({ array: [...array], action: "swap", indices: [i, j] });
  }

  function partition(low: number, high: number) {
    const pivot = array[high];
    let i = low;

    for (let j = low; j < high; j += 1) {
      steps.push({ array: [...array], action: "compare", indices: [j, high] });
      if (array[j] <= pivot) {
        if (i !== j) {
          swap(i, j);
        }
        i += 1;
      }
    }

    if (i !== high) {
      swap(i, high);
    }

    return i;
  }

  function quickSort(low: number, high: number) {
    if (low < high) {
      const pivotIndex = partition(low, high);
      quickSort(low, pivotIndex - 1);
      quickSort(pivotIndex + 1, high);
    }
  }

  quickSort(0, array.length - 1);
  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });

  return steps;
}
