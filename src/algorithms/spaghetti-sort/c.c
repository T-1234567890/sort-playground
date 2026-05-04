void spaghetti_sort(int values[], int length) {
    for (int end = length - 1; end > 0; end--) {
        int longest = 0;

        for (int i = 1; i <= end; i++) {
            if (values[i] > values[longest]) {
                longest = i;
            }
        }

        int temp = values[longest];
        values[longest] = values[end];
        values[end] = temp;
    }
}
