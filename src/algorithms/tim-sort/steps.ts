import type { Step } from "../../core/types";

const RUN = 32;

export function timSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  function insertionSort(left: number, right: number) {
    for (let index = left + 1; index <= right; index += 1) {
      const value = array[index];
      let pointer = index - 1;

      while (pointer >= left) {
        steps.push({ array: [...array], action: "compare", indices: [pointer, index] });
        if (array[pointer] <= value) {
          break;
        }

        array[pointer + 1] = array[pointer];
        steps.push({ array: [...array], action: "overwrite", indices: [pointer + 1] });
        pointer -= 1;
      }

      array[pointer + 1] = value;
      steps.push({ array: [...array], action: "overwrite", indices: [pointer + 1] });
    }
  }

  function merge(left: number, middle: number, right: number) {
    const leftSlice = array.slice(left, middle + 1);
    const rightSlice = array.slice(middle + 1, right + 1);
    let leftIndex = 0;
    let rightIndex = 0;
    let target = left;

    while (leftIndex < leftSlice.length && rightIndex < rightSlice.length) {
      steps.push({ array: [...array], action: "compare", indices: [left + leftIndex, middle + 1 + rightIndex] });
      if (leftSlice[leftIndex] <= rightSlice[rightIndex]) {
        array[target] = leftSlice[leftIndex];
        leftIndex += 1;
      } else {
        array[target] = rightSlice[rightIndex];
        rightIndex += 1;
      }

      steps.push({ array: [...array], action: "overwrite", indices: [target] });
      target += 1;
    }

    while (leftIndex < leftSlice.length) {
      array[target] = leftSlice[leftIndex];
      steps.push({ array: [...array], action: "overwrite", indices: [target] });
      leftIndex += 1;
      target += 1;
    }

    while (rightIndex < rightSlice.length) {
      array[target] = rightSlice[rightIndex];
      steps.push({ array: [...array], action: "overwrite", indices: [target] });
      rightIndex += 1;
      target += 1;
    }
  }

  for (let start = 0; start < array.length; start += RUN) {
    insertionSort(start, Math.min(start + RUN - 1, array.length - 1));
  }

  for (let size = RUN; size < array.length; size *= 2) {
    for (let left = 0; left < array.length; left += size * 2) {
      const middle = Math.min(left + size - 1, array.length - 1);
      const right = Math.min(left + size * 2 - 1, array.length - 1);

      if (middle < right) {
        merge(left, middle, right);
      }
    }
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
