def bubble_sort(values):
    values = values[:]

    for end in range(len(values) - 1, 0, -1):
        for i in range(end):
            if values[i] > values[i + 1]:
                values[i], values[i + 1] = values[i + 1], values[i]

    return values
