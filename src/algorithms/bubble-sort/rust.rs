pub fn bubble_sort(values: &mut [i32]) {
    if values.len() < 2 {
        return;
    }

    for end in (1..values.len()).rev() {
        for i in 0..end {
            if values[i] > values[i + 1] {
                values.swap(i, i + 1);
            }
        }
    }
}
