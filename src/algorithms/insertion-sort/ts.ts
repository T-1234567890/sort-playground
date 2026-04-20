export function insertionSort(values: number[]): number[] {
  const result = values.slice();

  for (let index = 1; index < result.length; index += 1) {
    const current = result[index];
    let scan = index - 1;

    while (scan >= 0 && result[scan] > current) {
      result[scan + 1] = result[scan];
      scan -= 1;
    }

    result[scan + 1] = current;
  }

  return result;
}
