import type { Step } from "../../core/types";

function greatestPowerOfTwoLessThan(length: number) {
  let power = 1;

  while (power < length) {
    power <<= 1;
  }

  return power >> 1;
}

export function bitonicSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  function compareAndSwap(left: number, right: number, ascending: boolean) {
    steps.push({ array: [...array], action: "compare", indices: [left, right] });

    if ((ascending && array[left] > array[right]) || (!ascending && array[left] < array[right])) {
      [array[left], array[right]] = [array[right], array[left]];
      steps.push({ array: [...array], action: "swap", indices: [left, right] });
    }
  }

  function bitonicMerge(start: number, length: number, ascending: boolean) {
    if (length <= 1) {
      return;
    }

    const step = greatestPowerOfTwoLessThan(length);

    for (let index = start; index < start + length - step; index += 1) {
      compareAndSwap(index, index + step, ascending);
    }

    bitonicMerge(start, step, ascending);
    bitonicMerge(start + step, length - step, ascending);
  }

  function bitonicSort(start: number, length: number, ascending: boolean) {
    if (length <= 1) {
      return;
    }

    const half = Math.floor(length / 2);
    bitonicSort(start, half, true);
    bitonicSort(start + half, length - half, false);
    bitonicMerge(start, length, ascending);
  }

  bitonicSort(0, array.length, true);
  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });

  return steps;
}
