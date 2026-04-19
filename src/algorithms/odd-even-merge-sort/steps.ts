import type { Step } from "../../core/types";

export function oddEvenMergeSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  function compareAndSwap(left: number, right: number) {
    steps.push({ array: [...array], action: "compare", indices: [left, right] });

    if (array[left] > array[right]) {
      [array[left], array[right]] = [array[right], array[left]];
      steps.push({ array: [...array], action: "swap", indices: [left, right] });
    }
  }

  function oddEvenMerge(start: number, length: number, gap: number) {
    const step = gap * 2;

    if (step < length) {
      oddEvenMerge(start, length, step);
      oddEvenMerge(start + gap, length, step);

      for (let index = start + gap; index + gap < start + length; index += step) {
        compareAndSwap(index, index + gap);
      }
    } else if (start + gap < start + length) {
      compareAndSwap(start, start + gap);
    }
  }

  function oddEvenMergeSort(start: number, length: number) {
    if (length <= 1) {
      return;
    }

    const half = Math.floor(length / 2);
    oddEvenMergeSort(start, half);
    oddEvenMergeSort(start + half, length - half);
    oddEvenMerge(start, length, 1);
  }

  oddEvenMergeSort(0, array.length);
  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });

  return steps;
}
