void cycle_sort(int values[], int length) {
    for (int cycle_start = 0; cycle_start < length - 1; cycle_start++) {
        int item = values[cycle_start];
        int position = cycle_start;

        for (int index = cycle_start + 1; index < length; index++) {
            if (values[index] < item) {
                position++;
            }
        }

        if (position == cycle_start) {
            continue;
        }

        while (item == values[position]) {
            position++;
        }

        int temp = values[position];
        values[position] = item;
        item = temp;

        while (position != cycle_start) {
            position = cycle_start;

            for (int index = cycle_start + 1; index < length; index++) {
                if (values[index] < item) {
                    position++;
                }
            }

            while (item == values[position]) {
                position++;
            }

            temp = values[position];
            values[position] = item;
            item = temp;
        }
    }
}
