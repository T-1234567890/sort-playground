#include <vector>
#include <utility>

std::vector<int> combSort(std::vector<int> values) {
    int gap = static_cast<int>(values.size());
    bool swapped = true;

    while (gap > 1 || swapped) {
        gap = (gap * 10) / 13;
        if (gap < 1) {
            gap = 1;
        }

        swapped = false;

        for (int index = 0; index + gap < static_cast<int>(values.size()); ++index) {
            if (values[index] > values[index + gap]) {
                std::swap(values[index], values[index + gap]);
                swapped = true;
            }
        }
    }

    return values;
}
