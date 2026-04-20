#include <stdlib.h>

#define RUN 32

static void insertion_sort(int values[], int left, int right) {
    for (int index = left + 1; index <= right; index++) {
        int value = values[index];
        int pointer = index - 1;

        while (pointer >= left && values[pointer] > value) {
            values[pointer + 1] = values[pointer];
            pointer -= 1;
        }

        values[pointer + 1] = value;
    }
}

static void merge(int values[], int left, int middle, int right) {
    int left_length = middle - left + 1;
    int right_length = right - middle;
    int *left_slice = (int *)malloc(sizeof(int) * left_length);
    int *right_slice = (int *)malloc(sizeof(int) * right_length);

    for (int index = 0; index < left_length; index++) {
        left_slice[index] = values[left + index];
    }

    for (int index = 0; index < right_length; index++) {
        right_slice[index] = values[middle + 1 + index];
    }

    int left_index = 0;
    int right_index = 0;
    int target = left;

    while (left_index < left_length && right_index < right_length) {
        if (left_slice[left_index] <= right_slice[right_index]) {
            values[target++] = left_slice[left_index++];
        } else {
            values[target++] = right_slice[right_index++];
        }
    }

    while (left_index < left_length) {
        values[target++] = left_slice[left_index++];
    }

    while (right_index < right_length) {
        values[target++] = right_slice[right_index++];
    }

    free(left_slice);
    free(right_slice);
}

void tim_sort(int values[], int length) {
    for (int start = 0; start < length; start += RUN) {
        int right = start + RUN - 1;
        if (right >= length) {
            right = length - 1;
        }
        insertion_sort(values, start, right);
    }

    for (int size = RUN; size < length; size *= 2) {
        for (int left = 0; left < length; left += size * 2) {
            int middle = left + size - 1;
            int right = left + size * 2 - 1;

            if (middle >= length) {
                middle = length - 1;
            }
            if (right >= length) {
                right = length - 1;
            }

            if (middle < right) {
                merge(values, left, middle, right);
            }
        }
    }
}
