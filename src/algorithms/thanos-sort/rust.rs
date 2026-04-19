pub fn thanos_sort(values: &mut [i32]) {
    let mut survivors = values.to_vec();

    while survivors.len() > 1 && survivors.windows(2).any(|window| window[0] > window[1]) {
        survivors = survivors
            .into_iter()
            .enumerate()
            .filter_map(|(index, value)| if index % 2 == 0 { Some(value) } else { None })
            .collect();
    }

    let remaining = survivors.len();

    for (index, value) in survivors.iter().copied().enumerate() {
        values[index] = value;
    }

    if remaining > 0 {
        let fill_value = survivors[remaining - 1];
        for value in values.iter_mut().skip(remaining) {
            *value = fill_value;
        }
    }
}
