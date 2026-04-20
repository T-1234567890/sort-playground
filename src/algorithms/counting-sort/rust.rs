pub fn counting_sort(values: &mut [i32]) {
    if values.is_empty() {
        return;
    }

    let min = *values.iter().min().unwrap();
    let max = *values.iter().max().unwrap();
    let mut counts = vec![0usize; (max - min + 1) as usize];

    for &value in values.iter() {
        counts[(value - min) as usize] += 1;
    }

    let mut write = 0usize;
    for (offset, count) in counts.iter().enumerate() {
        for _ in 0..*count {
            values[write] = min + offset as i32;
            write += 1;
        }
    }
}
