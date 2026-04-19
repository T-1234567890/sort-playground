pub fn stooge_sort(values: &mut [i32]) {
    if values.len() > 1 {
        sort(values, 0, values.len() - 1);
    }
}

fn sort(values: &mut [i32], left: usize, right: usize) {
    if left >= right {
        return;
    }

    if values[left] > values[right] {
        values.swap(left, right);
    }

    if right - left + 1 > 2 {
        let third = (right - left + 1) / 3;
        sort(values, left, right - third);
        sort(values, left + third, right);
        sort(values, left, right - third);
    }
}
