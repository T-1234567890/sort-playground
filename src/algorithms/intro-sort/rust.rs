fn floor_log2(mut value: usize) -> usize {
    let mut result = 0;
    while value > 1 {
        value /= 2;
        result += 1;
    }
    result
}

fn insertion_sort(values: &mut [i32]) {
    for index in 1..values.len() {
        let value = values[index];
        let mut position = index;

        while position > 0 && values[position - 1] > value {
            values[position] = values[position - 1];
            position -= 1;
        }

        values[position] = value;
    }
}

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

fn heap_sort(values: &mut [i32]) {
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

fn partition(values: &mut [i32]) -> usize {
    let high = values.len() - 1;
    let pivot = values[high];
    let mut store = 0usize;

    for index in 0..high {
        if values[index] <= pivot {
            values.swap(store, index);
            store += 1;
        }
    }

    values.swap(store, high);
    store
}

fn intro_sort_recursive(values: &mut [i32], depth_limit: usize) {
    if values.len() <= 1 {
        return;
    }

    if values.len() <= 16 {
        insertion_sort(values);
        return;
    }

    if depth_limit == 0 {
        heap_sort(values);
        return;
    }

    let pivot_index = partition(values);
    let (left, right_with_pivot) = values.split_at_mut(pivot_index);
    intro_sort_recursive(left, depth_limit - 1);

    if right_with_pivot.len() > 1 {
        intro_sort_recursive(&mut right_with_pivot[1..], depth_limit - 1);
    }
}

pub fn intro_sort(values: &mut [i32]) {
    let depth_limit = floor_log2(values.len().max(2)) * 2;
    intro_sort_recursive(values, depth_limit);
}
