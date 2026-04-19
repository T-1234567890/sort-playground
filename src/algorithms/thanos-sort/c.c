void thanos_sort(int values[], int length) {
    int remaining = length;

    while (remaining > 1) {
        int sorted = 1;
        for (int index = 1; index < remaining; index++) {
            if (values[index - 1] > values[index]) {
                sorted = 0;
                break;
            }
        }

        if (sorted) {
            break;
        }

        int write = 0;
        for (int index = 0; index < remaining; index += 2) {
            values[write++] = values[index];
        }
        remaining = write;
    }

    if (remaining == 0) {
        return;
    }

    for (int index = remaining; index < length; index++) {
        values[index] = values[remaining - 1];
    }
}
