#include <stddef.h>
#include <stdlib.h>

static void radix_non_negative(int *arr, size_t length) {
    int max = 0;
    for (size_t i = 0; i < length; i += 1) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }

    for (int exp = 1; max / exp > 0; exp *= 10) {
        int *output = malloc(length * sizeof(int));
        size_t counts[10] = {0};

        if (!output) {
            return;
        }

        for (size_t i = 0; i < length; i += 1) {
            counts[(arr[i] / exp) % 10] += 1;
        }

        for (size_t i = 1; i < 10; i += 1) {
            counts[i] += counts[i - 1];
        }

        for (size_t i = length; i > 0; i -= 1) {
            int digit = (arr[i - 1] / exp) % 10;
            counts[digit] -= 1;
            output[counts[digit]] = arr[i - 1];
        }

        for (size_t i = 0; i < length; i += 1) {
            arr[i] = output[i];
        }

        free(output);
    }
}

int *radix_sort(const int *values, size_t length) {
    int *result = malloc(length * sizeof(int));
    int *negatives = malloc(length * sizeof(int));
    int *positives = malloc(length * sizeof(int));
    size_t negative_count = 0;
    size_t positive_count = 0;

    if (!result || !negatives || !positives) {
        free(result);
        free(negatives);
        free(positives);
        return NULL;
    }

    for (size_t i = 0; i < length; i += 1) {
        if (values[i] < 0) {
          negatives[negative_count++] = -values[i];
        } else {
          positives[positive_count++] = values[i];
        }
    }

    radix_non_negative(negatives, negative_count);
    radix_non_negative(positives, positive_count);

    size_t index = 0;
    for (size_t i = negative_count; i > 0; i -= 1) {
        result[index++] = -negatives[i - 1];
    }
    for (size_t i = 0; i < positive_count; i += 1) {
        result[index++] = positives[i];
    }

    free(negatives);
    free(positives);
    return result;
}
