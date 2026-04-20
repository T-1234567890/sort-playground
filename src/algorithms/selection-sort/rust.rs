pub fn selection_sort(values: &mut [i32]) {
    let length = values.len();

    for start in 0..length.saturating_sub(1) {
        let mut min_index = start;

        for index in (start + 1)..length {
            if values[index] < values[min_index] {
                min_index = index;
            }
        }

        values.swap(start, min_index);
    }
}
