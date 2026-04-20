import type { Step } from "../../core/types";

function floorLog2(value: number) {
  let result = 0;
  let current = value;

  while (current > 1) {
    current = Math.floor(current / 2);
    result += 1;
  }

  return result;
}

export function introSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  function swap(left: number, right: number) {
    [array[left], array[right]] = [array[right], array[left]];
    steps.push({ array: [...array], action: "swap", indices: [left, right] });
  }

  function insertionSort(start: number, end: number) {
    for (let i = start + 1; i <= end; i += 1) {
      const value = array[i];
      let j = i - 1;

      while (j >= start) {
        steps.push({ array: [...array], action: "compare", indices: [j, j + 1] });
        if (array[j] <= value) {
          break;
        }

        array[j + 1] = array[j];
        steps.push({ array: [...array], action: "overwrite", indices: [j + 1] });
        j -= 1;
      }

      array[j + 1] = value;
      steps.push({ array: [...array], action: "overwrite", indices: [j + 1] });
    }
  }

  function siftDown(start: number, end: number, rootOffset: number) {
    let root = start;

    while (root * 2 + 1 <= end) {
      const leftChild = root * 2 + 1;
      const rightChild = leftChild + 1;
      let largest = root;

      steps.push({ array: [...array], action: "compare", indices: [rootOffset + largest, rootOffset + leftChild] });
      if (array[rootOffset + leftChild] > array[rootOffset + largest]) {
        largest = leftChild;
      }

      if (rightChild <= end) {
        steps.push({ array: [...array], action: "compare", indices: [rootOffset + largest, rootOffset + rightChild] });
        if (array[rootOffset + rightChild] > array[rootOffset + largest]) {
          largest = rightChild;
        }
      }

      if (largest === root) {
        return;
      }

      swap(rootOffset + root, rootOffset + largest);
      root = largest;
    }
  }

  function heapSort(start: number, end: number) {
    const length = end - start + 1;

    for (let root = Math.floor(length / 2) - 1; root >= 0; root -= 1) {
      siftDown(root, length - 1, start);
    }

    for (let tail = length - 1; tail > 0; tail -= 1) {
      swap(start, start + tail);
      siftDown(0, tail - 1, start);
    }
  }

  function partition(low: number, high: number) {
    const pivot = array[high];
    let store = low;

    for (let index = low; index < high; index += 1) {
      steps.push({ array: [...array], action: "compare", indices: [index, high] });
      if (array[index] <= pivot) {
        if (store !== index) {
          swap(store, index);
        }
        store += 1;
      }
    }

    if (store !== high) {
      swap(store, high);
    }

    return store;
  }

  function introSort(low: number, high: number, depthLimit: number) {
    const length = high - low + 1;

    if (length <= 1) {
      return;
    }

    if (length <= 16) {
      insertionSort(low, high);
      return;
    }

    if (depthLimit === 0) {
      heapSort(low, high);
      return;
    }

    const pivotIndex = partition(low, high);
    introSort(low, pivotIndex - 1, depthLimit - 1);
    introSort(pivotIndex + 1, high, depthLimit - 1);
  }

  introSort(0, array.length - 1, floorLog2(Math.max(array.length, 2)) * 2);
  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });

  return steps;
}
