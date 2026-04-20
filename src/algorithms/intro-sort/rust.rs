fn floor_log2(mut value: usize) -> usize {
    let mut result = 0;
    while value > 1 {
        value /= 2;
        result += 1;
    }
    result
}

pub fn intro_sort(values: &[i32]) -> Vec<i32> {
    let mut arr = values.to_vec();

    fn insertion_sort(arr: &mut [i32], start: usize, end: usize) {
        for index in start + 1..=end {
            let value = arr[index];
            let mut position = index;

            while position > start && arr[position - 1] > value {
                arr[position] = arr[position - 1];
                position -= 1;
            }

            arr[position] = value;
        }
    }

    fn sift_down(arr: &mut [i32], start: usize, end: usize, offset: usize) {
        let mut root = start;

        while root * 2 + 1 <= end {
            let child = root * 2 + 1;
            let mut swap_index = root;

            if arr[offset + swap_index] < arr[offset + child] {
                swap_index = child;
            }

            if child + 1 <= end && arr[offset + swap_index] < arr[offset + child + 1] {
                swap_index = child + 1;
            }

            if swap_index == root {
                return;
            }

            arr.swap(offset + root, offset + swap_index);
            root = swap_index;
        }
    }

    fn heap_sort(arr: &mut [i32], start: usize, end: usize) {
        let length = end - start + 1;

        for root in (0..=(length / 2)).rev() {
            sift_down(arr, root, length - 1, start);
            if root == 0 {
                break;
            }
        }

        for tail in (1..length).rev() {
            arr.swap(start, start + tail);
            sift_down(arr, 0, tail - 1, start);
        }
    }

    fn partition(arr: &mut [i32], low: usize, high: usize) -> usize {
        let pivot = arr[high];
        let mut store = low;

        for index in low..high {
            if arr[index] <= pivot {
                arr.swap(store, index);
                store += 1;
            }
        }

        arr.swap(store, high);
        store
    }

    fn sort(arr: &mut [i32], low: usize, high: usize, depth_limit: usize) {
        if high <= low {
          return;
        }

        let length = high - low + 1;
        if length <= 16 {
            insertion_sort(arr, low, high);
            return;
        }

        if depth_limit == 0 {
            heap_sort(arr, low, high);
            return;
        }

        let pivot_index = partition(arr, low, high);
        if pivot_index > 0 {
            sort(arr, low, pivot_index - 1, depth_limit - 1);
        }
        sort(arr, pivot_index + 1, high, depth_limit - 1);
    }

    if arr.len() > 1 {
        let depth_limit = floor_log2(arr.len().max(2)) * 2;
        let end = arr.len() - 1;
        sort(&mut arr, 0, end, depth_limit);
    }

    arr
}
