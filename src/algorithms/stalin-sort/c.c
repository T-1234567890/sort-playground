#include <stddef.h>

size_t stalin_sort(const int values[], size_t length, int output[]) {
    if (length == 0) {
        return 0;
    }

    size_t count = 0;
    output[count++] = values[0];

    for (size_t i = 1; i < length; i++) {
        if (values[i] >= output[count - 1]) {
            output[count++] = values[i];
        }
    }

    return count;
}
