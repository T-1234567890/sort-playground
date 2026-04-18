pub fn bogo_sort(values: &mut [i32]) {
    let mut seed = values.len() as u64 + 1;

    while !values.windows(2).all(|pair| pair[0] <= pair[1]) {
        shuffle(values, &mut seed);
    }
}

fn shuffle(values: &mut [i32], seed: &mut u64) {
    for i in (1..values.len()).rev() {
        *seed = seed.wrapping_mul(6364136223846793005).wrapping_add(1);
        let j = (*seed as usize) % (i + 1);
        values.swap(i, j);
    }
}
