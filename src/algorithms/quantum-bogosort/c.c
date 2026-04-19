#include <stdlib.h>

static int compare_values(const void *left, const void *right) {
    const int left_value = *(const int *) left;
    const int right_value = *(const int *) right;
    return (left_value > right_value) - (left_value < right_value);
}

void quantum_bogosort(int values[], int length) {
    for (int index = length - 1; index > 0; index--) {
        int swap_index = (index * 7 + 3) % (index + 1);
        int temp = values[index];
        values[index] = values[swap_index];
        values[swap_index] = temp;
    }

    for (int index = 1; index < length; index++) {
        if (values[index - 1] > values[index]) {
            qsort(values, (size_t) length, sizeof(int), compare_values);
            return;
        }
    }
}
