#include <stddef.h>
#include <stdlib.h>

void counting_sort(int values[], int length) {
    if (length <= 0) {
        return;
    }

    int min = values[0];
    int max = values[0];

    for (int i = 1; i < length; i += 1) {
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
        return;
    }

    for (int i = 0; i < length; i += 1) {
        counts[values[i] - min] += 1;
    }

    int write = 0;
    for (size_t offset = 0; offset < range; offset += 1) {
        while (counts[offset] > 0) {
            values[write++] = (int)offset + min;
            counts[offset] -= 1;
        }
    }

    free(counts);
}
