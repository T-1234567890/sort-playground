use std::thread;
use std::time::Duration;

fn is_sorted(values: &[i32]) -> bool {
    values.windows(2).all(|pair| pair[0] <= pair[1])
}

pub fn miracle_sort(values: &[i32]) -> Vec<i32> {
    let result = values.to_vec();

    while !is_sorted(&result) {
        thread::sleep(Duration::from_secs(1));
    }

    result
}
