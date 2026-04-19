pub fn quick_sort(values: &mut [i32]) {
    let mut stack = vec![(0usize, values.len())];

    while let Some((start, end)) = stack.pop() {
        if end.saturating_sub(start) <= 1 {
            continue;
        }

        let pivot_index = partition(&mut values[start..end]) + start;
        let left = (start, pivot_index);
        let right = (pivot_index + 1, end);

        let left_len = left.1.saturating_sub(left.0);
        let right_len = right.1.saturating_sub(right.0);

        if left_len > right_len {
            if left_len > 1 {
                stack.push(left);
            }
            if right_len > 1 {
                stack.push(right);
            }
        } else {
            if right_len > 1 {
                stack.push(right);
            }
            if left_len > 1 {
                stack.push(left);
            }
        }
    }
}

fn partition(values: &mut [i32]) -> usize {
    let high = values.len() - 1;
    let pivot = median_of_three(values);
    let mut i = 0;

    for j in 0..high {
        if values[j] <= pivot {
            values.swap(i, j);
            i += 1;
        }
    }

    values.swap(i, high);
    i
}

fn median_of_three(values: &mut [i32]) -> i32 {
    let high = values.len() - 1;
    let mid = high / 2;

    if values[0] > values[mid] {
        values.swap(0, mid);
    }
    if values[0] > values[high] {
        values.swap(0, high);
    }
    if values[mid] > values[high] {
        values.swap(mid, high);
    }

    values.swap(mid, high);
    values[high]
}
