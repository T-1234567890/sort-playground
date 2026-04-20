pub fn shell_sort(values: &mut [i32]) {
    let mut gap = values.len() / 2;

    while gap > 0 {
        for index in gap..values.len() {
            let value = values[index];
            let mut position = index;

            while position >= gap && values[position - gap] > value {
                values[position] = values[position - gap];
                position -= gap;
            }

            values[position] = value;
        }

        gap /= 2;
    }
}
