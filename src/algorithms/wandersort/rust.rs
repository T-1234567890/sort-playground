fn is_sorted(values: &[i32]) -> bool {
    values.windows(2).all(|pair| pair[0] <= pair[1])
}

fn next_random(seed: &mut u32) -> usize {
    *seed = seed.wrapping_mul(1664525).wrapping_add(1013904223);
    *seed as usize
}

pub fn wandersort(values: &mut [i32]) {
    if values.len() < 2 {
        return;
    }

    let mut seed = values
        .iter()
        .enumerate()
        .fold(2166136261u32, |sum, (index, value)| {
            sum.wrapping_add((*value as u32).wrapping_mul(index as u32 + 17))
        });

    while !is_sorted(values) {
        let mut left = next_random(&mut seed) % values.len();
        let mut right = next_random(&mut seed) % values.len();

        if left == right {
            continue;
        }

        if left > right {
            std::mem::swap(&mut left, &mut right);
        }

        if values[left] > values[right] {
            values.swap(left, right);
        }
    }
}
