#include <stddef.h>

static void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

static int partition(int values[], int low, int high) {
    int pivot = values[high];
    int i = low;

    for (int j = low; j < high; j++) {
        if (values[j] <= pivot) {
            swap(&values[i], &values[j]);
            i++;
        }
    }

    swap(&values[i], &values[high]);
    return i;
}

void quick_sort(int values[], int low, int high) {
    if (low < high) {
        int pivot = partition(values, low, high);
        quick_sort(values, low, pivot - 1);
        quick_sort(values, pivot + 1, high);
    }
}
