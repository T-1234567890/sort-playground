#include <stddef.h>
#include <stdlib.h>

int *shell_sort(const int *values, size_t length) {
    int *arr = malloc(length * sizeof(int));
    if (!arr) {
        return NULL;
    }

    for (size_t i = 0; i < length; i += 1) {
        arr[i] = values[i];
    }

    for (size_t gap = length / 2; gap > 0; gap /= 2) {
        for (size_t index = gap; index < length; index += 1) {
            int value = arr[index];
            size_t position = index;

            while (position >= gap && arr[position - gap] > value) {
                arr[position] = arr[position - gap];
                position -= gap;
            }

            arr[position] = value;
        }
    }

    return arr;
}
