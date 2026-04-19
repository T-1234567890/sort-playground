static void sift_down(int values[], int start, int end) {
    int root = start;

    while (root * 2 + 1 <= end) {
        int child = root * 2 + 1;
        int candidate = root;

        if (values[candidate] < values[child]) {
            candidate = child;
        }

        if (child + 1 <= end && values[candidate] < values[child + 1]) {
            candidate = child + 1;
        }

        if (candidate == root) {
            return;
        }

        int temp = values[root];
        values[root] = values[candidate];
        values[candidate] = temp;
        root = candidate;
    }
}

void smoothsort(int values[], int length) {
    if (length <= 1) {
        return;
    }

    for (int start = length / 2; start >= 0; start--) {
        sift_down(values, start, length - 1);
    }

    for (int end = length - 1; end > 0; end--) {
        int temp = values[0];
        values[0] = values[end];
        values[end] = temp;
        sift_down(values, 0, end - 1);
    }
}
