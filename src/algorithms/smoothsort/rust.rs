fn sift_down(values: &mut [i32], start: usize, end: usize) {
    let mut root = start;

    while root * 2 + 1 <= end {
        let child = root * 2 + 1;
        let mut candidate = root;

        if values[candidate] < values[child] {
            candidate = child;
        }

        if child + 1 <= end && values[candidate] < values[child + 1] {
            candidate = child + 1;
        }

        if candidate == root {
            return;
        }

        values.swap(root, candidate);
        root = candidate;
    }
}

pub fn smoothsort(values: &mut [i32]) {
    if values.len() <= 1 {
        return;
    }

    for start in (0..=(values.len() / 2)).rev() {
        sift_down(values, start, values.len() - 1);
    }

    for end in (1..values.len()).rev() {
        values.swap(0, end);
        sift_down(values, 0, end - 1);
    }
}
