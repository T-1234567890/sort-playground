pub fn spaghetti_sort(values: &mut [i32]) {
    if values.len() < 2 {
        return;
    }

    for end in (1..values.len()).rev() {
        let mut longest = 0;

        for i in 1..=end {
            if values[i] > values[longest] {
                longest = i;
            }
        }

        values.swap(longest, end);
    }
}
