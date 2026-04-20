void selection_sort(int values[], int length) {
    for (int start = 0; start < length - 1; start++) {
        int min_index = start;

        for (int index = start + 1; index < length; index++) {
            if (values[index] < values[min_index]) {
                min_index = index;
            }
        }

        int temp = values[start];
        values[start] = values[min_index];
        values[min_index] = temp;
    }
}
