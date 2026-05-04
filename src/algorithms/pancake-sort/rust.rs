fn reverse_prefix(values: &mut [i32], end: usize) {
    let mut left = 0;
    let mut right = end;

    while left < right {
        values.swap(left, right);
        left += 1;
        right -= 1;
    }
}

pub fn pancake_sort(values: &mut [i32]) {
    if values.len() < 2 {
        return;
    }

    for size in (2..=values.len()).rev() {
        let mut max_index = 0;

        for i in 1..size {
            if values[i] > values[max_index] {
                max_index = i;
            }
        }

        if max_index == size - 1 {
            continue;
        }

        if max_index > 0 {
            reverse_prefix(values, max_index);
        }

        reverse_prefix(values, size - 1);
    }
}
