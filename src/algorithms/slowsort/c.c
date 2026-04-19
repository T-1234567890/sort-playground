static void slowsort_range(int values[], int left, int right) {
    if (left >= right) {
        return;
    }

    int middle = (left + right) / 2;
    slowsort_range(values, left, middle);
    slowsort_range(values, middle + 1, right);

    if (values[middle] > values[right]) {
        int temp = values[middle];
        values[middle] = values[right];
        values[right] = temp;
    }

    slowsort_range(values, left, right - 1);
}

void slowsort(int values[], int length) {
    if (length > 1) {
        slowsort_range(values, 0, length - 1);
    }
}
