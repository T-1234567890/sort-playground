#include <stdlib.h>

static void merge(int values[], int left, int middle, int right) {
    int left_count = middle - left + 1;
    int right_count = right - middle;
    int *left_values = malloc(sizeof(int) * left_count);
    int *right_values = malloc(sizeof(int) * right_count);

    for (int i = 0; i < left_count; i++) left_values[i] = values[left + i];
    for (int j = 0; j < right_count; j++) right_values[j] = values[middle + 1 + j];

    int i = 0, j = 0, write = left;
    while (i < left_count && j < right_count) {
        values[write++] = left_values[i] <= right_values[j] ? left_values[i++] : right_values[j++];
    }
    while (i < left_count) values[write++] = left_values[i++];
    while (j < right_count) values[write++] = right_values[j++];

    free(left_values);
    free(right_values);
}

void merge_sort(int values[], int left, int right) {
    if (left < right) {
        int middle = left + (right - left) / 2;
        merge_sort(values, left, middle);
        merge_sort(values, middle + 1, right);
        merge(values, left, middle, right);
    }
}
