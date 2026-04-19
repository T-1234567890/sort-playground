pub fn cycle_sort(values: &mut [i32]) {
    let length = values.len();

    for cycle_start in 0..length.saturating_sub(1) {
        let mut item = values[cycle_start];
        let mut position = cycle_start;

        for index in (cycle_start + 1)..length {
            if values[index] < item {
                position += 1;
            }
        }

        if position == cycle_start {
            continue;
        }

        while item == values[position] {
            position += 1;
        }

        std::mem::swap(&mut values[position], &mut item);

        while position != cycle_start {
            position = cycle_start;

            for index in (cycle_start + 1)..length {
                if values[index] < item {
                    position += 1;
                }
            }

            while item == values[position] {
                position += 1;
            }

            std::mem::swap(&mut values[position], &mut item);
        }
    }
}
