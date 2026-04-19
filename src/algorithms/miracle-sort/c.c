static int is_sorted(int values[], int length) {
    for (int i = 1; i < length; i++) {
        if (values[i - 1] > values[i]) {
            return 0;
        }
    }
    return 1;
}

void miracle_sort(int values[], int length) {
    while (!is_sorted(values, length)) {
        /* Wait for a miracle. */
    }
}
