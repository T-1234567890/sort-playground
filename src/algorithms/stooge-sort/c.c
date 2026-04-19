static void stooge_sort_range(int values[], int left, int right) {
    if (left >= right) {
        return;
    }

    if (values[left] > values[right]) {
        int temp = values[left];
        values[left] = values[right];
        values[right] = temp;
    }

    if (right - left + 1 > 2) {
        int third = (right - left + 1) / 3;
        stooge_sort_range(values, left, right - third);
        stooge_sort_range(values, left + third, right);
        stooge_sort_range(values, left, right - third);
    }
}

void stooge_sort(int values[], int length) {
    if (length > 1) {
        stooge_sort_range(values, 0, length - 1);
    }
}
