#include <vector>
#include <utility>

std::vector<int> selectionSort(std::vector<int> values) {
    const int length = static_cast<int>(values.size());

    for (int left = 0; left < length - 1; ++left) {
        int min_index = left;

        for (int right = left + 1; right < length; ++right) {
            if (values[right] < values[min_index]) {
                min_index = right;
            }
        }

        std::swap(values[left], values[min_index]);
    }

    return values;
}
