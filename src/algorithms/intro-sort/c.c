#include <stddef.h>
#include <stdlib.h>

static void swap_int(int *left, int *right) {
    int temp = *left;
    *left = *right;
    *right = temp;
}

static size_t floor_log2(size_t value) {
    size_t result = 0;
    while (value > 1) {
        value /= 2;
        result += 1;
    }
    return result;
}

static void insertion_sort(int *arr, size_t start, size_t end) {
    for (size_t index = start + 1; index <= end; index += 1) {
        int value = arr[index];
        size_t position = index;

        while (position > start && arr[position - 1] > value) {
            arr[position] = arr[position - 1];
            position -= 1;
        }

        arr[position] = value;
    }
}

static void sift_down(int *arr, size_t start, size_t end, size_t offset) {
    size_t root = start;

    while (root * 2 + 1 <= end) {
        size_t child = root * 2 + 1;
        size_t swap_index = root;

        if (arr[offset + swap_index] < arr[offset + child]) {
            swap_index = child;
        }

        if (child + 1 <= end && arr[offset + swap_index] < arr[offset + child + 1]) {
            swap_index = child + 1;
        }

        if (swap_index == root) {
            return;
        }

        swap_int(&arr[offset + root], &arr[offset + swap_index]);
        root = swap_index;
    }
}

static void heap_sort(int *arr, size_t start, size_t end) {
    size_t length = end - start + 1;

    for (size_t root = length / 2; root > 0; root -= 1) {
        sift_down(arr, root - 1, length - 1, start);
    }

    for (size_t tail = length - 1; tail > 0; tail -= 1) {
        swap_int(&arr[start], &arr[start + tail]);
        sift_down(arr, 0, tail - 1, start);
    }
}

static size_t partition(int *arr, size_t low, size_t high) {
    int pivot = arr[high];
    size_t store = low;

    for (size_t index = low; index < high; index += 1) {
        if (arr[index] <= pivot) {
            swap_int(&arr[store], &arr[index]);
            store += 1;
        }
    }

    swap_int(&arr[store], &arr[high]);
    return store;
}

static void intro_sort_recursive(int *arr, size_t low, size_t high, size_t depth_limit) {
    if (high <= low) {
        return;
    }

    size_t length = high - low + 1;
    if (length <= 16) {
        insertion_sort(arr, low, high);
        return;
    }

    if (depth_limit == 0) {
        heap_sort(arr, low, high);
        return;
    }

    size_t pivot_index = partition(arr, low, high);
    if (pivot_index > 0) {
        intro_sort_recursive(arr, low, pivot_index - 1, depth_limit - 1);
    }
    intro_sort_recursive(arr, pivot_index + 1, high, depth_limit - 1);
}

int *intro_sort(const int *values, size_t length) {
    int *arr = malloc(length * sizeof(int));
    if (!arr) {
        return NULL;
    }

    for (size_t i = 0; i < length; i += 1) {
        arr[i] = values[i];
    }

    if (length > 1) {
        size_t depth_limit = floor_log2(length > 1 ? length : 2) * 2;
        intro_sort_recursive(arr, 0, length - 1, depth_limit);
    }

    return arr;
}
