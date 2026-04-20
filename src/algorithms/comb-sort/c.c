void comb_sort(int values[], int length) {
    double shrink_factor = 1.3;
    int gap = length;
    int swapped = 1;

    while (gap > 1 || swapped) {
        gap = (int)(gap / shrink_factor);
        if (gap < 1) {
            gap = 1;
        }

        swapped = 0;

        for (int index = 0; index + gap < length; index++) {
            if (values[index] > values[index + gap]) {
                int temp = values[index];
                values[index] = values[index + gap];
                values[index + gap] = temp;
                swapped = 1;
            }
        }
    }
}
