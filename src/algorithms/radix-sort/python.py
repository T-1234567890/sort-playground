def _radix_non_negative(values):
    arr = values[:]
    exp = 1
    maximum = max(arr, default=0)

    while maximum // exp > 0:
        output = [0] * len(arr)
        counts = [0] * 10

        for value in arr:
            counts[(value // exp) % 10] += 1

        for index in range(1, 10):
            counts[index] += counts[index - 1]

        for index in range(len(arr) - 1, -1, -1):
            digit = (arr[index] // exp) % 10
            counts[digit] -= 1
            output[counts[digit]] = arr[index]

        arr = output
        exp *= 10

    return arr


def radix_sort(values):
    negatives = [-value for value in values if value < 0]
    positives = [value for value in values if value >= 0]

    sorted_negatives = [-value for value in reversed(_radix_non_negative(negatives))]
    sorted_positives = _radix_non_negative(positives)

    return sorted_negatives + sorted_positives
