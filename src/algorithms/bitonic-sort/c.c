#include <stdbool.h>
#include <stdlib.h>

static int greatest_power_of_two_less_than(int length) {
    int power = 1;

    while (power < length) {
        power <<= 1;
    }

    return power >> 1;
}

static void bitonic_merge_range(int values[], int start, int length, bool ascending) {
    if (length <= 1) {
        return;
    }

    int step = greatest_power_of_two_less_than(length);

    for (int index = start; index < start + length - step; index++) {
        int partner = index + step;
        bool should_swap = ascending ? values[index] > values[partner] : values[index] < values[partner];

        if (should_swap) {
            int temp = values[index];
            values[index] = values[partner];
            values[partner] = temp;
        }
    }

    bitonic_merge_range(values, start, step, ascending);
    bitonic_merge_range(values, start + step, length - step, ascending);
}

static void bitonic_sort_range(int values[], int start, int length, bool ascending) {
    if (length <= 1) {
        return;
    }

    int half = length / 2;
    bitonic_sort_range(values, start, half, true);
    bitonic_sort_range(values, start + half, length - half, false);
    bitonic_merge_range(values, start, length, ascending);
}

void bitonic_sort(int values[], int length) {
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

    bitonic_sort_range(working, 0, padded_length, true);

    for (int index = 0; index < length; index++) {
        values[index] = working[index];
    }

    free(working);
}
