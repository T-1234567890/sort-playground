import type { Step } from "../../core/types";

export function beadSortSteps(input: number[]): Step[] {
  const array = input.map((value) => Math.max(0, Math.floor(value)));
  const steps: Step[] = [{ array: [...array], action: "compare", indices: array.map((_, index) => index) }];
  const max = Math.max(...array, 0);

  if (array.length === 0 || max === 0) {
    steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
    return steps;
  }

  const beadCounts = Array.from({ length: max }, () => 0);

  array.forEach((value, index) => {
    steps.push({ array: [...array], action: "compare", indices: [index] });
    for (let bead = 0; bead < value; bead += 1) {
      beadCounts[bead] += 1;
    }
  });

  for (let row = array.length - 1; row >= 0; row -= 1) {
    let value = 0;
    for (let bead = 0; bead < max; bead += 1) {
      if (beadCounts[bead] > 0) {
        value += 1;
        beadCounts[bead] -= 1;
      }
    }
    array[row] = value;
    steps.push({ array: [...array], action: "overwrite", indices: [row] });
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
