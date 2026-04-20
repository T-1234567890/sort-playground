const RUN: usize = 32;

fn insertion_sort(values: &mut [i32], left: usize, right: usize) {
    for index in (left + 1)..=right {
        let value = values[index];
        let mut pointer = index;

        while pointer > left && values[pointer - 1] > value {
            values[pointer] = values[pointer - 1];
            pointer -= 1;
        }

        values[pointer] = value;
    }
}

fn merge(values: &mut [i32], left: usize, middle: usize, right: usize) {
    let left_slice = values[left..=middle].to_vec();
    let right_slice = values[(middle + 1)..=right].to_vec();
    let mut left_index = 0;
    let mut right_index = 0;
    let mut target = left;

    while left_index < left_slice.len() && right_index < right_slice.len() {
      if left_slice[left_index] <= right_slice[right_index] {
          values[target] = left_slice[left_index];
          left_index += 1;
      } else {
          values[target] = right_slice[right_index];
          right_index += 1;
      }
      target += 1;
    }

    while left_index < left_slice.len() {
        values[target] = left_slice[left_index];
        left_index += 1;
        target += 1;
    }

    while right_index < right_slice.len() {
        values[target] = right_slice[right_index];
        right_index += 1;
        target += 1;
    }
}

pub fn tim_sort(values: &mut [i32]) {
    let length = values.len();

    if length <= 1 {
        return;
    }

    for start in (0..length).step_by(RUN) {
        let right = usize::min(start + RUN - 1, length - 1);
        insertion_sort(values, start, right);
    }

    let mut size = RUN;
    while size < length {
        for left in (0..length).step_by(size * 2) {
            let middle = usize::min(left + size - 1, length - 1);
            let right = usize::min(left + size * 2 - 1, length - 1);

            if middle < right {
                merge(values, left, middle, right);
            }
        }
        size *= 2;
    }
}
