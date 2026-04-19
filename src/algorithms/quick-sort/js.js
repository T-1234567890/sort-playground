export function quickSort(values) {
  if (values.length <= 1) {
    return [...values];
  }

  const [pivot, ...rest] = values;
  const left = rest.filter((value) => value <= pivot);
  const right = rest.filter((value) => value > pivot);

  return [...quickSort(left), pivot, ...quickSort(right)];
}
