pub fn heap_sort(values: &[i32]) -> Vec<i32> {
    let mut arr = values.to_vec();

    fn sift_down(arr: &mut [i32], start: usize, end: usize) {
        let mut root = start;

        while root * 2 + 1 <= end {
            let child = root * 2 + 1;
            let mut swap_index = root;

            if arr[swap_index] < arr[child] {
                swap_index = child;
            }

            if child + 1 <= end && arr[swap_index] < arr[child + 1] {
                swap_index = child + 1;
            }

            if swap_index == root {
                return;
            }

            arr.swap(root, swap_index);
            root = swap_index;
        }
    }

    if arr.len() < 2 {
        return arr;
    }

    for start in (0..=(arr.len() / 2)).rev() {
        sift_down(&mut arr, start, arr.len() - 1);
        if start == 0 {
            break;
        }
    }

    for end in (1..arr.len()).rev() {
        arr.swap(0, end);
        sift_down(&mut arr, 0, end - 1);
    }

    arr
}
