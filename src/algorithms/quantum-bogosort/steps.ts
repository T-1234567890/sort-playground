import type { Step } from "../../core/types";

function isSorted(values: number[]) {
  return values.every((value, index) => index === 0 || values[index - 1] <= value);
}

export function quantumBogosortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = (index * 7 + 3) % (index + 1);
    if (swapIndex !== index) {
      [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
      steps.push({ array: [...array], action: "swap", indices: [index, swapIndex] });
    }
  }

  for (let index = 1; index < array.length; index += 1) {
    steps.push({ array: [...array], action: "compare", indices: [index - 1, index] });
  }

  if (!isSorted(array)) {
    array.sort((left, right) => left - right);
    steps.push({ array: [...array], action: "overwrite", indices: array.map((_, index) => index) });
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
