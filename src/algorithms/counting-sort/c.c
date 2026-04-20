#include <stddef.h>
#include <stdlib.h>

int *counting_sort(const int *values, size_t length) {
    int *result = malloc(length * sizeof(int));
    if (!result) {
        return NULL;
    }

    if (length == 0) {
        return result;
    }

    int min = values[0];
    int max = values[0];

    for (size_t i = 1; i < length; i += 1) {
        if (values[i] < min) {
            min = values[i];
        }
        if (values[i] > max) {
            max = values[i];
        }
    }

    size_t range = (size_t)(max - min + 1);
    size_t *counts = calloc(range, sizeof(size_t));
    if (!counts) {
        free(result);
        return NULL;
    }

    for (size_t i = 0; i < length; i += 1) {
        counts[values[i] - min] += 1;
    }

    size_t index = 0;
    for (size_t offset = 0; offset < range; offset += 1) {
        while (counts[offset] > 0) {
            result[index++] = (int)offset + min;
            counts[offset] -= 1;
        }
    }

    free(counts);
    return result;
}
