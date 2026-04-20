#include <stddef.h>
#include <stdlib.h>

static void radix_non_negative(int values[], int length) {
    int max = 0;
    for (int i = 0; i < length; i += 1) {
        if (values[i] > max) {
            max = values[i];
        }
    }

    for (int exp = 1; max / exp > 0; exp *= 10) {
        int *output = malloc((size_t) length * sizeof(int));
        size_t counts[10] = {0};

        if (!output) {
            return;
        }

        for (int i = 0; i < length; i += 1) {
            counts[(values[i] / exp) % 10] += 1;
        }

        for (size_t i = 1; i < 10; i += 1) {
            counts[i] += counts[i - 1];
        }

        for (int i = length - 1; i >= 0; i -= 1) {
            int digit = (values[i] / exp) % 10;
            counts[digit] -= 1;
            output[counts[digit]] = values[i];
        }

        for (int i = 0; i < length; i += 1) {
            values[i] = output[i];
        }

        free(output);
    }
}

void radix_sort(int values[], int length) {
    if (length <= 1) {
        return;
    }

    int *negatives = malloc((size_t) length * sizeof(int));
    int *positives = malloc((size_t) length * sizeof(int));
    int negative_count = 0;
    int positive_count = 0;

    if (!negatives || !positives) {
        free(negatives);
        free(positives);
        return;
    }

    for (int i = 0; i < length; i += 1) {
        if (values[i] < 0) {
            negatives[negative_count++] = -values[i];
        } else {
            positives[positive_count++] = values[i];
        }
    }

    radix_non_negative(negatives, negative_count);
    radix_non_negative(positives, positive_count);

    int write = 0;
    for (int i = negative_count - 1; i >= 0; i -= 1) {
        values[write++] = -negatives[i];
    }
    for (int i = 0; i < positive_count; i += 1) {
        values[write++] = positives[i];
    }

    free(negatives);
    free(positives);
}
