pub fn cocktail_shaker_sort(values: &mut [i32]) {
    if values.len() <= 1 {
        return;
    }

    let mut start = 0usize;
    let mut end = values.len() - 1;
    let mut swapped = true;

    while swapped {
        swapped = false;

        for index in start..end {
            if values[index] > values[index + 1] {
                values.swap(index, index + 1);
                swapped = true;
            }
        }

        if !swapped {
            break;
        }

        swapped = false;
        end -= 1;

        for index in (start + 1..=end).rev() {
            if values[index - 1] > values[index] {
                values.swap(index - 1, index);
                swapped = true;
            }
        }

        start += 1;
    }
}
