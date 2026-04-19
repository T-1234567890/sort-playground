#include <stdlib.h>

static int *compact_values(int shelf[], int occupied[], int capacity, int *count) {
    int total = 0;

    for (int index = 0; index < capacity; index++) {
        if (occupied[index]) {
            total++;
        }
    }

    int *ordered = malloc((size_t) total * sizeof(int));
    int write = 0;

    for (int index = 0; index < capacity; index++) {
        if (occupied[index]) {
            ordered[write++] = shelf[index];
        }
    }

    *count = total;
    return ordered;
}

static void rebalance(int shelf[], int occupied[], int capacity) {
    int count = 0;
    int *ordered = compact_values(shelf, occupied, capacity, &count);

    for (int index = 0; index < capacity; index++) {
        occupied[index] = 0;
        shelf[index] = 0;
    }

    for (int index = 0; index < count; index++) {
        int slot = ((index + 1) * capacity) / (count + 1);
        while (occupied[slot]) {
            slot++;
        }
        shelf[slot] = ordered[index];
        occupied[slot] = 1;
    }

    free(ordered);
}

static int find_insert_slot(int shelf[], int occupied[], int capacity, int value) {
    int count = 0;
    int *ordered = compact_values(shelf, occupied, capacity, &count);
    int left = 0;
    int right = count;

    while (left < right) {
        int middle = (left + right) / 2;
        if (ordered[middle] <= value) {
            left = middle + 1;
        } else {
            right = middle;
        }
    }

    free(ordered);

    if (count == 0) {
        return capacity / 2;
    }

    int seen = 0;
    int left_bound = -1;
    int right_bound = capacity;

    for (int index = 0; index < capacity; index++) {
        if (!occupied[index]) {
            continue;
        }

        if (seen == left - 1) {
            left_bound = index;
        }

        if (seen == left) {
            right_bound = index;
            break;
        }

        seen++;
    }

    for (int slot = left_bound + 1; slot < right_bound; slot++) {
        if (!occupied[slot]) {
            return slot;
        }
    }

    return -1;
}

void library_sort(int values[], int length) {
    if (length <= 0) {
        return;
    }

    int capacity = length * 2 + 1;
    int *shelf = calloc((size_t) capacity, sizeof(int));
    int *occupied = calloc((size_t) capacity, sizeof(int));
    int count = 0;

    for (int index = 0; index < length; index++) {
        int value = values[index];

        if (count == 0) {
            int slot = capacity / 2;
            shelf[slot] = value;
            occupied[slot] = 1;
            count++;
            continue;
        }

        int slot = find_insert_slot(shelf, occupied, capacity, value);
        while (slot < 0) {
            rebalance(shelf, occupied, capacity);
            slot = find_insert_slot(shelf, occupied, capacity, value);
        }

        shelf[slot] = value;
        occupied[slot] = 1;
        count++;
    }

    int write = 0;
    for (int index = 0; index < capacity; index++) {
        if (occupied[index]) {
            values[write++] = shelf[index];
        }
    }

    free(shelf);
    free(occupied);
}
