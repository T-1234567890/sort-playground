void shell_sort(int values[], int length) {
    for (int gap = length / 2; gap > 0; gap /= 2) {
        for (int index = gap; index < length; index += 1) {
            int value = values[index];
            int position = index;

            while (position >= gap && values[position - gap] > value) {
                values[position] = values[position - gap];
                position -= gap;
            }

            values[position] = value;
        }
    }
}
