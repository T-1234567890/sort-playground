void insertion_sort(int values[], int length) {
    for (int i = 1; i < length; i++) {
        int key = values[i];
        int j = i - 1;

        while (j >= 0 && values[j] > key) {
            values[j + 1] = values[j];
            j--;
        }

        values[j + 1] = key;
    }
}
