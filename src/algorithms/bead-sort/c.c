#include <stdlib.h>

void bead_sort(unsigned int values[], int length) {
    if (length < 2) {
        return;
    }

    unsigned int max_value = 0;
    for (int i = 0; i < length; i++) {
        if (values[i] > max_value) {
            max_value = values[i];
        }
    }

    unsigned int *beads = calloc(max_value, sizeof(unsigned int));
    for (int i = 0; i < length; i++) {
        for (unsigned int bead = 0; bead < values[i]; bead++) {
            beads[bead]++;
        }
    }

    for (int row = length - 1; row >= 0; row--) {
        unsigned int value = 0;
        for (unsigned int bead = 0; bead < max_value; bead++) {
            if (beads[bead] > 0) {
                value++;
                beads[bead]--;
            }
        }
        values[row] = value;
    }

    free(beads);
}
