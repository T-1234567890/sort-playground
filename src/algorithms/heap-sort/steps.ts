import type { Step } from "../../core/types";

export function heapSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  function swap(left: number, right: number) {
    [array[left], array[right]] = [array[right], array[left]];
    steps.push({ array: [...array], action: "swap", indices: [left, right] });
  }

  function siftDown(start: number, end: number) {
    let root = start;

    while (root * 2 + 1 <= end) {
      const leftChild = root * 2 + 1;
      const rightChild = leftChild + 1;
      let largest = root;

      steps.push({ array: [...array], action: "compare", indices: [largest, leftChild] });
      if (array[leftChild] > array[largest]) {
        largest = leftChild;
      }

      if (rightChild <= end) {
        steps.push({ array: [...array], action: "compare", indices: [largest, rightChild] });
        if (array[rightChild] > array[largest]) {
          largest = rightChild;
        }
      }

      if (largest === root) {
        return;
      }

      swap(root, largest);
      root = largest;
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
