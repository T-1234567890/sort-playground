fn is_sorted(values: &[i32]) -> bool {
    values.windows(2).all(|pair| pair[0] <= pair[1])
}

fn next_random(state: &mut u64) -> usize {
    *state = state.wrapping_mul(6364136223846793005).wrapping_add(1);
    (*state >> 32) as usize
}

pub fn bozo_sort(values: &mut [i32]) {
    let mut state = values.len() as u64 + 1;

    while !is_sorted(values) {
        let i = next_random(&mut state) % values.len();
        let j = next_random(&mut state) % values.len();
        values.swap(i, j);
    }
}
