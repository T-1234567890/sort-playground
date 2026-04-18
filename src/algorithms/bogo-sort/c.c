#include <stdbool.h>
#include <stdlib.h>

static bool is_sorted(int values[], int length) {
    for (int i = 1; i < length; i++) {
        if (values[i - 1] > values[i]) {
            return false;
        }
    }
    return true;
}

static void shuffle(int values[], int length) {
    for (int i = length - 1; i > 0; i--) {
        int j = rand() % (i + 1);
        int temp = values[i];
        values[i] = values[j];
        values[j] = temp;
    }
}

void bogo_sort(int values[], int length) {
    while (!is_sorted(values, length)) {
        shuffle(values, length);
    }
}
