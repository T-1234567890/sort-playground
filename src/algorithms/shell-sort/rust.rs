pub fn shell_sort(values: &[i32]) -> Vec<i32> {
    let mut arr = values.to_vec();
    let mut gap = arr.len() / 2;

    while gap > 0 {
        for index in gap..arr.len() {
            let value = arr[index];
            let mut position = index;

            while position >= gap && arr[position - gap] > value {
                arr[position] = arr[position - gap];
                position -= gap;
            }

            arr[position] = value;
        }

        gap /= 2;
    }

    arr
}
