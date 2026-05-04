fn merge(left: &[i32], right: &[i32]) -> Vec<i32> {
    let mut result = Vec::with_capacity(left.len() + right.len());
    let mut i = 0;
    let mut j = 0;

    while i < left.len() && j < right.len() {
        if left[i] <= right[j] {
            result.push(left[i]);
            i += 1;
        } else {
            result.push(right[j]);
            j += 1;
        }
    }

    result.extend_from_slice(&left[i..]);
    result.extend_from_slice(&right[j..]);
    result
}

pub fn strand_sort(values: &mut [i32]) {
    let mut unsorted = values.to_vec();
    let mut result: Vec<i32> = Vec::new();

    while !unsorted.is_empty() {
        let mut strand = vec![unsorted.remove(0)];
        let mut remaining = Vec::new();

        for value in unsorted {
            if value >= *strand.last().unwrap() {
                strand.push(value);
            } else {
                remaining.push(value);
            }
        }

        result = merge(&result, &strand);
        unsorted = remaining;
    }

    values.copy_from_slice(&result);
}
