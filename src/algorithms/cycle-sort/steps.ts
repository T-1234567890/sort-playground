import type { Step } from "../../core/types";

export function cycleSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  for (let cycleStart = 0; cycleStart < array.length - 1; cycleStart += 1) {
    let item = array[cycleStart];
    let position = cycleStart;

    for (let index = cycleStart + 1; index < array.length; index += 1) {
      steps.push({ array: [...array], action: "compare", indices: [cycleStart, index] });
      if (array[index] < item) {
        position += 1;
      }
    }

    if (position === cycleStart) {
      continue;
    }

    while (item === array[position]) {
      position += 1;
    }

    [item, array[position]] = [array[position], item];
    steps.push({ array: [...array], action: "overwrite", indices: [position] });

    while (position !== cycleStart) {
      position = cycleStart;

      for (let index = cycleStart + 1; index < array.length; index += 1) {
        steps.push({ array: [...array], action: "compare", indices: [cycleStart, index] });
        if (array[index] < item) {
          position += 1;
        }
      }

      while (item === array[position]) {
        position += 1;
      }

      [item, array[position]] = [array[position], item];
      steps.push({ array: [...array], action: "overwrite", indices: [position] });
    }
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
