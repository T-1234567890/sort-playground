export function quickSort(values: number[]): number[] {
  if (values.length <= 1) {
    return values.slice();
  }

  const [pivot, ...rest] = values;
  const lower = rest.filter((value) => value < pivot);
  const higherOrEqual = rest.filter((value) => value >= pivot);

  return [...quickSort(lower), pivot, ...quickSort(higherOrEqual)];
}
