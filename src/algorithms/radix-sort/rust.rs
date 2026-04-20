fn radix_non_negative(values: &[i32]) -> Vec<i32> {
    let mut arr = values.to_vec();
    let mut exp = 1;
    let max = arr.iter().copied().max().unwrap_or(0);

    while max / exp > 0 {
        let mut output = vec![0; arr.len()];
        let mut counts = [0usize; 10];

        for &value in &arr {
            counts[((value / exp) % 10) as usize] += 1;
        }

        for i in 1..counts.len() {
            counts[i] += counts[i - 1];
        }

        for index in (0..arr.len()).rev() {
            let digit = ((arr[index] / exp) % 10) as usize;
            counts[digit] -= 1;
            output[counts[digit]] = arr[index];
        }

        arr = output;
        exp *= 10;
    }

    arr
}

pub fn radix_sort(values: &[i32]) -> Vec<i32> {
    let negatives: Vec<i32> = values.iter().copied().filter(|value| *value < 0).map(|value| -value).collect();
    let positives: Vec<i32> = values.iter().copied().filter(|value| *value >= 0).collect();

    let mut sorted_negatives: Vec<i32> = radix_non_negative(&negatives).into_iter().rev().map(|value| -value).collect();
    let mut sorted_positives = radix_non_negative(&positives);

    sorted_negatives.append(&mut sorted_positives);
    sorted_negatives
}
