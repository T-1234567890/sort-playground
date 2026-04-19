#include <stdlib.h>

static int is_sorted(int values[], int length) {
    for (int i = 1; i < length; i++) {
        if (values[i - 1] > values[i]) {
            return 0;
        }
    }
    return 1;
}

void bozo_sort(int values[], int length) {
    while (!is_sorted(values, length)) {
        int i = rand() % length;
        int j = rand() % length;
        int temp = values[i];
        values[i] = values[j];
        values[j] = temp;
    }
}
