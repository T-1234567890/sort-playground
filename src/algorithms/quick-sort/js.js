export function quickSort(values) {
  const items = [...values];

  if (items.length <= 1) {
    return items;
  }

  const stack = [[0, items.length - 1]];

  while (stack.length > 0) {
    const [low, high] = stack.pop();

    if (low >= high) {
      continue;
    }

    const pivotIndex = partition(items, low, high);
    const left = [low, pivotIndex - 1];
    const right = [pivotIndex + 1, high];
    const leftLength = left[1] - left[0];
    const rightLength = right[1] - right[0];

    if (leftLength > rightLength) {
      if (left[0] < left[1]) {
        stack.push(left);
      }
      if (right[0] < right[1]) {
        stack.push(right);
      }
    } else {
      if (right[0] < right[1]) {
        stack.push(right);
      }
      if (left[0] < left[1]) {
        stack.push(left);
      }
    }
  }

  return items;
}

function partition(items, low, high) {
  const pivot = medianOfThree(items, low, high);
  let index = low;

  for (let current = low; current < high; current += 1) {
    if (items[current] <= pivot) {
      [items[index], items[current]] = [items[current], items[index]];
      index += 1;
    }
  }

  [items[index], items[high]] = [items[high], items[index]];
  return index;
}

function medianOfThree(items, low, high) {
  const mid = low + Math.floor((high - low) / 2);

  if (items[low] > items[mid]) {
    [items[low], items[mid]] = [items[mid], items[low]];
  }
  if (items[low] > items[high]) {
    [items[low], items[high]] = [items[high], items[low]];
  }
  if (items[mid] > items[high]) {
    [items[mid], items[high]] = [items[high], items[mid]];
  }

  [items[mid], items[high]] = [items[high], items[mid]];
  return items[high];
}
