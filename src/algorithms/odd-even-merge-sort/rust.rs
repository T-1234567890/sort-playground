fn compare_and_swap(values: &mut [i32], left: usize, right: usize) {
    if values[left] > values[right] {
        values.swap(left, right);
    }
}

fn odd_even_merge(values: &mut [i32], start: usize, length: usize, gap: usize) {
    let step = gap * 2;

    if step < length {
      odd_even_merge(values, start, length, step);
      odd_even_merge(values, start + gap, length, step);

      let mut index = start + gap;
      while index + gap < start + length {
          compare_and_swap(values, index, index + gap);
          index += step;
      }
    } else if start + gap < start + length {
      compare_and_swap(values, start, start + gap);
    }
}

fn odd_even_merge_sort_range(values: &mut [i32], start: usize, length: usize) {
    if length <= 1 {
        return;
    }

    let half = length / 2;
    odd_even_merge_sort_range(values, start, half);
    odd_even_merge_sort_range(values, start + half, length - half);
    odd_even_merge(values, start, length, 1);
}

pub fn odd_even_merge_sort(values: &mut [i32]) {
    let length = values.len();
    odd_even_merge_sort_range(values, 0, length);
}
