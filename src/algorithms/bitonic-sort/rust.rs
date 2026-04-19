fn greatest_power_of_two_less_than(length: usize) -> usize {
    let mut power = 1usize;

    while power < length {
        power <<= 1;
    }

    power >> 1
}

fn bitonic_merge(values: &mut [i32], start: usize, length: usize, ascending: bool) {
    if length <= 1 {
        return;
    }

    let step = greatest_power_of_two_less_than(length);

    for index in start..(start + length - step) {
        let partner = index + step;
        let should_swap = if ascending {
            values[index] > values[partner]
        } else {
            values[index] < values[partner]
        };

        if should_swap {
            values.swap(index, partner);
        }
    }

    bitonic_merge(values, start, step, ascending);
    bitonic_merge(values, start + step, length - step, ascending);
}

fn bitonic_sort_range(values: &mut [i32], start: usize, length: usize, ascending: bool) {
    if length <= 1 {
        return;
    }

    let half = length / 2;
    bitonic_sort_range(values, start, half, true);
    bitonic_sort_range(values, start + half, length - half, false);
    bitonic_merge(values, start, length, ascending);
}

pub fn bitonic_sort(values: &mut [i32]) {
    if values.is_empty() {
        return;
    }

    let pad_value = values.iter().copied().max().unwrap_or(0) + 1;
    let mut length = 1usize;
    while length < values.len() {
        length <<= 1;
    }

    let original_len = values.len();
    let mut working = values.to_vec();
    working.resize(length, pad_value);
    bitonic_sort_range(&mut working, 0, length, true);
    values.copy_from_slice(&working[..original_len]);
}
