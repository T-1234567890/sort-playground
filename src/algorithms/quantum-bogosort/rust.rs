pub fn quantum_bogosort(values: &mut [i32]) {
    for index in (1..values.len()).rev() {
        let swap_index = (index * 7 + 3) % (index + 1);
        values.swap(index, swap_index);
    }

    if values.windows(2).any(|window| window[0] > window[1]) {
        values.sort();
    }
}
