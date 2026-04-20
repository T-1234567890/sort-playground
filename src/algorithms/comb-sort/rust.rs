pub fn comb_sort(values: &mut [i32]) {
    let shrink_factor = 1.3;
    let mut gap = values.len();
    let mut swapped = true;

    while gap > 1 || swapped {
        gap = usize::max(1, (gap as f64 / shrink_factor).floor() as usize);
        swapped = false;

        for index in 0..values.len().saturating_sub(gap) {
            if values[index] > values[index + gap] {
                values.swap(index, index + gap);
                swapped = true;
            }
        }
    }
}
