#include <stddef.h>
#include <stdlib.h>

static void swap_int(int *left, int *right) {
    int temp = *left;
    *left = *right;
    *right = temp;
}

static void sift_down(int *arr, size_t start, size_t end) {
    size_t root = start;

    while (root * 2 + 1 <= end) {
        size_t child = root * 2 + 1;
        size_t swap_index = root;

        if (arr[swap_index] < arr[child]) {
            swap_index = child;
        }

        if (child + 1 <= end && arr[swap_index] < arr[child + 1]) {
            swap_index = child + 1;
        }

        if (swap_index == root) {
            return;
        }

        swap_int(&arr[root], &arr[swap_index]);
        root = swap_index;
    }
}

int *heap_sort(const int *values, size_t length) {
    int *arr = malloc(length * sizeof(int));
    if (!arr) {
        return NULL;
    }

    for (size_t i = 0; i < length; i += 1) {
        arr[i] = values[i];
    }

    if (length < 2) {
        return arr;
    }

    for (size_t start = length / 2; start > 0; start -= 1) {
        sift_down(arr, start - 1, length - 1);
    }

    for (size_t end = length - 1; end > 0; end -= 1) {
        swap_int(&arr[0], &arr[end]);
        sift_down(arr, 0, end - 1);
    }

    return arr;
}
