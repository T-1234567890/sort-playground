pub fn bucket_sort(values: &[i32]) -> Vec<i32> {
    if values.is_empty() {
        return vec![];
    }

    let min = *values.iter().min().unwrap_or(&0);
    let max = *values.iter().max().unwrap_or(&0);
    let bucket_count = usize::max(1, (values.len() as f64).sqrt() as usize);
    let range = i32::max(1, max - min + 1) as usize;
    let mut buckets = vec![Vec::new(); bucket_count];

    for &value in values {
        let bucket_index = usize::min(bucket_count - 1, ((value - min) as usize * bucket_count) / range);
        buckets[bucket_index].push(value);
    }

    let mut result = Vec::with_capacity(values.len());
    for bucket in &mut buckets {
        bucket.sort();
        result.extend(bucket.iter().copied());
    }

    result
}
