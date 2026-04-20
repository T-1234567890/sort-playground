void cocktail_shaker_sort(int values[], int length) {
    int start = 0;
    int end = length - 1;
    int swapped = 1;

    while (swapped) {
        swapped = 0;

        for (int index = start; index < end; index++) {
            if (values[index] > values[index + 1]) {
                int temp = values[index];
                values[index] = values[index + 1];
                values[index + 1] = temp;
                swapped = 1;
            }
        }

        if (!swapped) {
            break;
        }

        swapped = 0;
        end--;

        for (int index = end; index > start; index--) {
            if (values[index - 1] > values[index]) {
                int temp = values[index - 1];
                values[index - 1] = values[index];
                values[index] = temp;
                swapped = 1;
            }
        }

        start++;
    }
}
