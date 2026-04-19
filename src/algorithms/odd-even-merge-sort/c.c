#include <stdlib.h>

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
    if (length <= 1) {
        return;
    }

    int pad_value = values[0];
    for (int index = 1; index < length; index++) {
        if (values[index] > pad_value) {
            pad_value = values[index];
        }
    }
    pad_value += 1;

    int padded_length = 1;
    while (padded_length < length) {
        padded_length <<= 1;
    }

    int *working = malloc((size_t) padded_length * sizeof(int));
    for (int index = 0; index < length; index++) {
        working[index] = values[index];
    }
    for (int index = length; index < padded_length; index++) {
        working[index] = pad_value;
    }

    odd_even_merge_sort_range(working, 0, padded_length);

    for (int index = 0; index < length; index++) {
        values[index] = working[index];
    }

    free(working);
}
