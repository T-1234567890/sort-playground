void manual_sort(int values[], int length, int source, int target) {
    if (source < 0 || target < 0 || source >= length || target >= length || source == target) {
        return;
    }

    int item = values[source];

    if (source < target) {
        for (int i = source; i < target; i++) {
            values[i] = values[i + 1];
        }
    } else {
        for (int i = source; i > target; i--) {
            values[i] = values[i - 1];
        }
    }

    values[target] = item;
}
