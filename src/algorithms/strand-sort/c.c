#include <stdlib.h>

void strand_sort(int values[], int length) {
    int *unsorted = (int *)malloc((size_t)length * sizeof(int));
    int *remaining = (int *)malloc((size_t)length * sizeof(int));
    int *strand = (int *)malloc((size_t)length * sizeof(int));
    int *result = (int *)malloc((size_t)length * sizeof(int));
    int *merged = (int *)malloc((size_t)length * sizeof(int));

    for (int i = 0; i < length; i++) {
        unsorted[i] = values[i];
    }

    int unsorted_length = length;
    int result_length = 0;

    while (unsorted_length > 0) {
        int strand_length = 1;
        int remaining_length = 0;
        strand[0] = unsorted[0];

        for (int i = 1; i < unsorted_length; i++) {
            if (unsorted[i] >= strand[strand_length - 1]) {
                strand[strand_length++] = unsorted[i];
            } else {
                remaining[remaining_length++] = unsorted[i];
            }
        }

        int i = 0;
        int j = 0;
        int k = 0;

        while (i < result_length && j < strand_length) {
            if (result[i] <= strand[j]) {
                merged[k++] = result[i++];
            } else {
                merged[k++] = strand[j++];
            }
        }

        while (i < result_length) {
            merged[k++] = result[i++];
        }

        while (j < strand_length) {
            merged[k++] = strand[j++];
        }

        for (int m = 0; m < k; m++) {
            result[m] = merged[m];
        }

        for (int m = 0; m < remaining_length; m++) {
            unsorted[m] = remaining[m];
        }

        result_length = k;
        unsorted_length = remaining_length;
    }

    for (int i = 0; i < length; i++) {
        values[i] = result[i];
    }

    free(unsorted);
    free(remaining);
    free(strand);
    free(result);
    free(merged);
}
