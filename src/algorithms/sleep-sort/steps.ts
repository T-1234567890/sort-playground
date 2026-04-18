import type { Step } from "../../core/types";

export function sleepSortSteps(input: number[]): Step[] {
  const ordered = [...input].sort((a, b) => a - b);
  const output: number[] = [];
  const steps: Step[] = [{ array: [...input], action: "compare", indices: input.map((_, index) => index) }];

  for (const value of ordered) {
    output.push(value);
    steps.push({ array: [...output], action: "swap", indices: [output.length - 1] });
  }

  steps.push({ array: [...output], action: "sorted", indices: output.map((_, index) => index) });
  return steps;
}
