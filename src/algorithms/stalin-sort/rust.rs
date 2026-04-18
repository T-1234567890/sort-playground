pub fn stalin_sort(values: &[i32]) -> Vec<i32> {
    let mut survivors = Vec::new();

    for &value in values {
        if survivors.last().map_or(true, |last| value >= *last) {
            survivors.push(value);
        }
    }

    survivors
}
