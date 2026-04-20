fn sift_down(values: &mut [i32], start: usize, end: usize) {
    let mut root = start;

    while root * 2 + 1 <= end {
        let child = root * 2 + 1;
        let mut swap_index = root;

        if values[swap_index] < values[child] {
            swap_index = child;
        }

        if child + 1 <= end && values[swap_index] < values[child + 1] {
            swap_index = child + 1;
        }

        if swap_index == root {
            return;
        }

        values.swap(root, swap_index);
        root = swap_index;
    }
}

pub fn heap_sort(values: &mut [i32]) {
    if values.len() <= 1 {
        return;
    }

    for start in (0..(values.len() / 2)).rev() {
        sift_down(values, start, values.len() - 1);
    }

    for end in (1..values.len()).rev() {
        values.swap(0, end);
        sift_down(values, 0, end - 1);
    }
}
