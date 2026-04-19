void bubble_sort(int values[], int length) {
    for (int end = length - 1; end > 0; end--) {
        for (int i = 0; i < end; i++) {
            if (values[i] > values[i + 1]) {
                int temp = values[i];
                values[i] = values[i + 1];
                values[i + 1] = temp;
            }
        }
    }
}
