fn radix_non_negative(values: &mut [i32]) {
    let max = values.iter().copied().max().unwrap_or(0);
    let mut exp = 1;

    while max / exp > 0 {
        let mut output = vec![0; values.len()];
        let mut counts = [0usize; 10];

        for &value in values.iter() {
            counts[((value / exp) % 10) as usize] += 1;
        }

        for index in 1..counts.len() {
            counts[index] += counts[index - 1];
        }

        for index in (0..values.len()).rev() {
            let digit = ((values[index] / exp) % 10) as usize;
            counts[digit] -= 1;
            output[counts[digit]] = values[index];
        }

        values.copy_from_slice(&output);
        exp *= 10;
    }
}

pub fn radix_sort(values: &mut [i32]) {
    let negatives: Vec<i32> = values.iter().copied().filter(|value| *value < 0).map(|value| -value).collect();
    let positives: Vec<i32> = values.iter().copied().filter(|value| *value >= 0).collect();

    let mut sorted_negatives = negatives;
    let mut sorted_positives = positives;

    radix_non_negative(&mut sorted_negatives);
    radix_non_negative(&mut sorted_positives);

    let mut write = 0usize;
    for value in sorted_negatives.into_iter().rev() {
        values[write] = -value;
        write += 1;
    }
    for value in sorted_positives {
        values[write] = value;
        write += 1;
    }
}
