import type { Step } from "../../core/types";

function radixNonNegative(values: number[], steps?: Step[]) {
  const array = [...values];
  const max = array.length > 0 ? Math.max(...array) : 0;

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const output = new Array(array.length).fill(0);
    const counts = new Array(10).fill(0);

    for (let i = 0; i < array.length; i += 1) {
      const digit = Math.floor(array[i] / exp) % 10;
      counts[digit] += 1;
    }

    for (let i = 1; i < counts.length; i += 1) {
      counts[i] += counts[i - 1];
    }

    for (let i = array.length - 1; i >= 0; i -= 1) {
      const digit = Math.floor(array[i] / exp) % 10;
      output[counts[digit] - 1] = array[i];
      counts[digit] -= 1;
    }

    for (let i = 0; i < array.length; i += 1) {
      array[i] = output[i];
      steps?.push({ array: [...array], action: "overwrite", indices: [i] });
    }
  }

  return array;
}

export function radixSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];
  const negatives = array.filter((value) => value < 0).map((value) => Math.abs(value));
  const positives = array.filter((value) => value >= 0);
  const sortedNegatives = radixNonNegative(negatives, steps).reverse().map((value) => -value);
  const sortedPositives = radixNonNegative(positives, steps);
  const result = [...sortedNegatives, ...sortedPositives];

  for (let i = 0; i < result.length; i += 1) {
    array[i] = result[i];
    steps.push({ array: [...array], action: "overwrite", indices: [i] });
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
