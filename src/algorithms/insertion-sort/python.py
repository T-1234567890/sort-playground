def insertion_sort(values):
    values = values[:]

    for i in range(1, len(values)):
        key = values[i]
        j = i - 1

        while j >= 0 and values[j] > key:
            values[j + 1] = values[j]
            j -= 1

        values[j + 1] = key

    return values
