#include <stddef.h>

static void swap_int(int *left, int *right) {
    int temp = *left;
    *left = *right;
    *right = temp;
}

static void sift_down(int values[], int start, int end) {
    int root = start;

    while (root * 2 + 1 <= end) {
        int child = root * 2 + 1;
        int swap_index = root;

        if (values[swap_index] < values[child]) {
            swap_index = child;
        }

        if (child + 1 <= end && values[swap_index] < values[child + 1]) {
            swap_index = child + 1;
        }

        if (swap_index == root) {
            return;
        }

        swap_int(&values[root], &values[swap_index]);
        root = swap_index;
    }
}

void heap_sort(int values[], int length) {
    if (length <= 1) {
        return;
    }

    for (int start = length / 2 - 1; start >= 0; start -= 1) {
        sift_down(values, start, length - 1);
    }

    for (int end = length - 1; end > 0; end -= 1) {
        swap_int(&values[0], &values[end]);
        sift_down(values, 0, end - 1);
    }
}
