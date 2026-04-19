pub fn gnome_sort(values: &mut [i32]) {
    let mut index = 1;

    while index < values.len() {
        if values[index - 1] <= values[index] {
            index += 1;
        } else {
            values.swap(index - 1, index);
            index = index.saturating_sub(1).max(1);
        }
    }
}
