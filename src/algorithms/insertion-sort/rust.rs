pub fn insertion_sort(values: &mut [i32]) {
    for i in 1..values.len() {
        let key = values[i];
        let mut j = i;

        while j > 0 && values[j - 1] > key {
            values[j] = values[j - 1];
            j -= 1;
        }

        values[j] = key;
    }
}
