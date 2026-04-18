pub fn quick_sort(values: &mut [i32]) {
    if values.len() <= 1 {
        return;
    }

    let pivot_index = partition(values);
    let (left, right) = values.split_at_mut(pivot_index);
    quick_sort(left);
    quick_sort(&mut right[1..]);
}

fn partition(values: &mut [i32]) -> usize {
    let high = values.len() - 1;
    let pivot = values[high];
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
