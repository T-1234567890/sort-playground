export function bubbleSort(values) {
  const array = [...values];

  for (let end = array.length - 1; end > 0; end -= 1) {
    for (let index = 0; index < end; index += 1) {
      if (array[index] > array[index + 1]) {
        [array[index], array[index + 1]] = [array[index + 1], array[index]];
      }
    }
  }

  return array;
}
