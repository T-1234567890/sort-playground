import type { Step } from "../../core/types";

export function countingSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  if (array.length === 0) {
    steps.push({ array: [], action: "sorted", indices: [] });
    return steps;
  }

  const min = Math.min(...array);
  const max = Math.max(...array);
  const counts = new Array(max - min + 1).fill(0);

  for (let i = 0; i < array.length; i += 1) {
    steps.push({ array: [...array], action: "compare", indices: [i] });
    counts[array[i] - min] += 1;
  }

  let writeIndex = 0;
  for (let value = min; value <= max; value += 1) {
    let remaining = counts[value - min];
    while (remaining > 0) {
      array[writeIndex] = value;
      steps.push({ array: [...array], action: "overwrite", indices: [writeIndex] });
      writeIndex += 1;
      remaining -= 1;
    }
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
