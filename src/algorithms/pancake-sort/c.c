static void pancake_reverse_prefix(int values[], int end) {
    int left = 0;
    int right = end;

    while (left < right) {
        int temp = values[left];
        values[left] = values[right];
        values[right] = temp;
        left++;
        right--;
    }
}

void pancake_sort(int values[], int length) {
    for (int size = length; size > 1; size--) {
        int max_index = 0;

        for (int i = 1; i < size; i++) {
            if (values[i] > values[max_index]) {
                max_index = i;
            }
        }

        if (max_index == size - 1) {
            continue;
        }

        if (max_index > 0) {
            pancake_reverse_prefix(values, max_index);
        }

        pancake_reverse_prefix(values, size - 1);
    }
}
