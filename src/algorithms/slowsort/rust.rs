pub fn slowsort(values: &mut [i32]) {
    if values.len() > 1 {
        sort(values, 0, values.len() - 1);
    }
}

fn sort(values: &mut [i32], left: usize, right: usize) {
    if left >= right {
        return;
    }

    let middle = (left + right) / 2;
    sort(values, left, middle);
    sort(values, middle + 1, right);

    if values[middle] > values[right] {
        values.swap(middle, right);
    }

    sort(values, left, right - 1);
}
