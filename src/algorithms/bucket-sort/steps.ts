import type { Step } from "../../core/types";

export function bucketSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  if (array.length === 0) {
    steps.push({ array: [], action: "sorted", indices: [] });
    return steps;
  }

  const min = Math.min(...array);
  const max = Math.max(...array);
  const bucketCount = Math.max(1, Math.floor(Math.sqrt(array.length)));
  const range = Math.max(1, max - min + 1);
  const buckets = Array.from({ length: bucketCount }, () => [] as number[]);

  for (let index = 0; index < array.length; index += 1) {
    steps.push({ array: [...array], action: "compare", indices: [index] });
    const bucketIndex = Math.min(bucketCount - 1, Math.floor(((array[index] - min) * bucketCount) / range));
    buckets[bucketIndex].push(array[index]);
  }

  let writeIndex = 0;
  for (const bucket of buckets) {
    bucket.sort((left, right) => left - right);

    for (const value of bucket) {
      array[writeIndex] = value;
      steps.push({ array: [...array], action: "overwrite", indices: [writeIndex] });
      writeIndex += 1;
    }
  }

  steps.push({ array: [...array], action: "sorted", indices: array.map((_, index) => index) });
  return steps;
}
