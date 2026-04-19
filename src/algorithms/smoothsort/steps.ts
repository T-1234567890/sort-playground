import type { Step } from "../../core/types";

export function smoothsortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  function swap(left: number, right: number) {
    [array[left], array[right]] = [array[right], array[left]];
    steps.push({ array: [...array], action: "swap", indices: [left, right] });
  }

  function siftDown(start: number, end: number) {
    let root = start;

    while (root * 2 + 1 <= end) {
      let child = root * 2 + 1;
      let candidate = root;

      steps.push({ array: [...array], action: "compare", indices: [candidate, child] });
      if (array[candidate] < array[child]) {
        candidate = child;
      }

      if (child + 1 <= end) {
        steps.push({ array: [...array], action: "compare", indices: [candidate, child + 1] });
        if (array[candidate] < array[child + 1]) {
          candidate = child + 1;
        }
      }

      if (candidate === root) {
        return;
      }

      swap(root, candidate);
      root = candidate;
    }
  }

  for (let start = Math.floor(array.length / 2) - 1; start >= 0; start -= 1) {
    siftDown(start, array.length - 1);
  }

  for (let end = array.length - 1; end > 0; end -= 1) {
    swap(0, end);
    siftDown(0, end - 1);
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
