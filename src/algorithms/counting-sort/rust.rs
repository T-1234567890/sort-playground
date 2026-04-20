pub fn counting_sort(values: &[i32]) -> Vec<i32> {
    if values.is_empty() {
        return Vec::new();
    }

    let min = *values.iter().min().unwrap();
    let max = *values.iter().max().unwrap();
    let mut counts = vec![0usize; (max - min + 1) as usize];

    for &value in values {
        counts[(value - min) as usize] += 1;
    }

    let mut result = Vec::with_capacity(values.len());
    for (offset, count) in counts.iter().enumerate() {
        for _ in 0..*count {
            result.push(min + offset as i32);
        }
    }

    result
}
