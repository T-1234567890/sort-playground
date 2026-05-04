import type { Step } from "../../core/types";

function merge(left: number[], right: number[]) {
  const result: number[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i += 1;
    } else {
      result.push(right[j]);
      j += 1;
    }
  }

  return result.concat(left.slice(i), right.slice(j));
}

export function strandSortSteps(input: number[]): Step[] {
  let unsorted = [...input];
  let result: number[] = [];
  const steps: Step[] = [{ array: [...unsorted], action: "compare", indices: [] }];

  while (unsorted.length > 0) {
    const strand = [unsorted.shift() as number];
    const remaining: number[] = [];

    for (const value of unsorted) {
      steps.push({
        array: [...result, ...strand, value, ...remaining],
        action: "compare",
        indices: [result.length + strand.length - 1, result.length + strand.length],
      });

      if (value >= strand[strand.length - 1]) {
        strand.push(value);
        steps.push({ array: [...result, ...strand, ...remaining], action: "overwrite", indices: [result.length + strand.length - 1] });
      } else {
        remaining.push(value);
      }
    }

    result = merge(result, strand);
    unsorted = remaining;
    steps.push({ array: [...result, ...unsorted], action: "overwrite", indices: result.map((_, index) => index) });
  }

  steps.push({ array: [...result], action: "sorted", indices: result.map((_, index) => index) });
  return steps;
}
