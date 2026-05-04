static int wandersort_is_sorted(int values[], int length) {
    for (int i = 1; i < length; i++) {
        if (values[i - 1] > values[i]) {
            return 0;
        }
    }

    return 1;
}

static unsigned int wandersort_next_random(unsigned int *seed) {
    *seed = (*seed * 1664525u) + 1013904223u;
    return *seed;
}

void wandersort(int values[], int length) {
    if (length < 2) {
        return;
    }

    unsigned int seed = 2166136261u;
    for (int i = 0; i < length; i++) {
        seed += (unsigned int)(values[i] * (i + 17));
    }

    while (!wandersort_is_sorted(values, length)) {
        int left = (int)(wandersort_next_random(&seed) % (unsigned int)length);
        int right = (int)(wandersort_next_random(&seed) % (unsigned int)length);

        if (left == right) {
            continue;
        }

        if (left > right) {
            int temp_index = left;
            left = right;
            right = temp_index;
        }

        if (values[left] > values[right]) {
            int temp = values[left];
            values[left] = values[right];
            values[right] = temp;
        }
    }
}
