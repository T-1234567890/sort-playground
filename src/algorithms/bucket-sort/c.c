void bucket_sort(int values[], int length) {
    for (int left = 0; left < length - 1; left++) {
        int min_index = left;

        for (int right = left + 1; right < length; right++) {
            if (values[right] < values[min_index]) {
                min_index = right;
            }
        }

        int temp = values[left];
        values[left] = values[min_index];
        values[min_index] = temp;
    }
}
