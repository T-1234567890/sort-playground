pub fn bead_sort(values: &[usize]) -> Vec<usize> {
    if values.is_empty() {
        return Vec::new();
    }

    let max_value = values.iter().copied().max().unwrap_or(0);
    let mut beads = vec![0; max_value];

    for &value in values {
        for bead in 0..value {
            beads[bead] += 1;
        }
    }

    let mut result = vec![0; values.len()];
    for row in (0..values.len()).rev() {
        for count in beads.iter_mut() {
            if *count > 0 {
                result[row] += 1;
                *count -= 1;
            }
        }
    }

    result
}
