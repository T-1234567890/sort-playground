static void compare_and_swap(int values[], int left, int right) {
    if (values[left] > values[right]) {
        int temp = values[left];
        values[left] = values[right];
        values[right] = temp;
    }
}

static void odd_even_merge(int values[], int start, int length, int gap) {
    int step = gap * 2;

    if (step < length) {
        odd_even_merge(values, start, length, step);
        odd_even_merge(values, start + gap, length, step);

        for (int index = start + gap; index + gap < start + length; index += step) {
            compare_and_swap(values, index, index + gap);
        }
    } else if (start + gap < start + length) {
        compare_and_swap(values, start, start + gap);
    }
}

static void odd_even_merge_sort_range(int values[], int start, int length) {
    if (length <= 1) {
        return;
    }

    int half = length / 2;
    odd_even_merge_sort_range(values, start, half);
    odd_even_merge_sort_range(values, start + half, length - half);
    odd_even_merge(values, start, length, 1);
}

void odd_even_merge_sort(int values[], int length) {
    odd_even_merge_sort_range(values, 0, length);
}
