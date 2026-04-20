import type { Step } from "../../core/types";

export function cocktailShakerSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  function swap(left: number, right: number) {
    [array[left], array[right]] = [array[right], array[left]];
    steps.push({ array: [...array], action: "swap", indices: [left, right] });
  }

  let start = 0;
  let end = array.length - 1;
  let swapped = true;

  while (swapped) {
    swapped = false;

    for (let index = start; index < end; index += 1) {
      steps.push({ array: [...array], action: "compare", indices: [index, index + 1] });
      if (array[index] > array[index + 1]) {
        swap(index, index + 1);
        swapped = true;
      }
    }

    if (!swapped) {
      break;
    }

    swapped = false;
    end -= 1;

    for (let index = end; index > start; index -= 1) {
      steps.push({ array: [...array], action: "compare", indices: [index - 1, index] });
      if (array[index - 1] > array[index]) {
        swap(index - 1, index);
        swapped = true;
      }
    }

    start += 1;
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
