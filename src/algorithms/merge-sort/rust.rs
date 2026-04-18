pub fn merge_sort(values: &[i32]) -> Vec<i32> {
    if values.len() <= 1 {
        return values.to_vec();
    }

    let middle = values.len() / 2;
    let left = merge_sort(&values[..middle]);
    let right = merge_sort(&values[middle..]);
    merge(&left, &right)
}

fn merge(left: &[i32], right: &[i32]) -> Vec<i32> {
    let mut merged = Vec::with_capacity(left.len() + right.len());
    let (mut i, mut j) = (0, 0);

    while i < left.len() && j < right.len() {
        if left[i] <= right[j] {
            merged.push(left[i]);
            i += 1;
        } else {
            merged.push(right[j]);
            j += 1;
        }
    }

    merged.extend_from_slice(&left[i..]);
    merged.extend_from_slice(&right[j..]);
    merged
}
