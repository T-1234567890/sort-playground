def selection_sort(values):
    values = values[:]

    for start in range(len(values) - 1):
        min_index = start

        for index in range(start + 1, len(values)):
            if values[index] < values[min_index]:
                min_index = index

        values[start], values[min_index] = values[min_index], values[start]

    return values
