import type { Step } from "../../core/types";

export function spaghettiSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  for (let end = array.length - 1; end > 0; end -= 1) {
    let longest = 0;

    for (let i = 1; i <= end; i += 1) {
      steps.push({ array: [...array], action: "compare", indices: [longest, i] });
      if (array[i] > array[longest]) {
        longest = i;
      }
    }

    if (longest !== end) {
      [array[longest], array[end]] = [array[end], array[longest]];
      steps.push({ array: [...array], action: "swap", indices: [longest, end] });
    }
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
