#include <stddef.h>

static void swap_int(int *left, int *right) {
    int temp = *left;
    *left = *right;
    *right = temp;
}

static int floor_log2_int(int value) {
    int result = 0;
    while (value > 1) {
        value /= 2;
        result += 1;
    }
    return result;
}

static void insertion_sort(int values[], int length) {
    for (int index = 1; index < length; index += 1) {
        int value = values[index];
        int position = index;

        while (position > 0 && values[position - 1] > value) {
            values[position] = values[position - 1];
            position -= 1;
        }

        values[position] = value;
    }
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

static void heap_sort(int values[], int length) {
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

static int partition(int values[], int length) {
    int pivot = values[length - 1];
    int store = 0;

    for (int index = 0; index < length - 1; index += 1) {
        if (values[index] <= pivot) {
            swap_int(&values[store], &values[index]);
            store += 1;
        }
    }

    swap_int(&values[store], &values[length - 1]);
    return store;
}

static void intro_sort_recursive(int values[], int length, int depth_limit) {
    if (length <= 1) {
        return;
    }

    if (length <= 16) {
        insertion_sort(values, length);
        return;
    }

    if (depth_limit == 0) {
        heap_sort(values, length);
        return;
    }

    int pivot_index = partition(values, length);
    intro_sort_recursive(values, pivot_index, depth_limit - 1);
    intro_sort_recursive(values + pivot_index + 1, length - pivot_index - 1, depth_limit - 1);
}

void intro_sort(int values[], int length) {
    int depth_limit = floor_log2_int(length > 1 ? length : 2) * 2;
    intro_sort_recursive(values, length, depth_limit);
}
