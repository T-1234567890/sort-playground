#include <stddef.h>

static void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

static int median_of_three(int values[], int low, int high) {
    int mid = low + (high - low) / 2;

    if (values[low] > values[mid]) {
        swap(&values[low], &values[mid]);
    }
    if (values[low] > values[high]) {
        swap(&values[low], &values[high]);
    }
    if (values[mid] > values[high]) {
        swap(&values[mid], &values[high]);
    }

    swap(&values[mid], &values[high]);
    return values[high];
}

static int partition(int values[], int low, int high) {
    int pivot = median_of_three(values, low, high);
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
    while (low < high) {
        int pivot = partition(values, low, high);
        if (pivot - low < high - pivot) {
            quick_sort(values, low, pivot - 1);
            low = pivot + 1;
        } else {
            quick_sort(values, pivot + 1, high);
            high = pivot - 1;
        }
    }
}
