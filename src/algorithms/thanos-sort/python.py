def thanos_sort(values):
    items = values[:]

    def is_sorted(sequence):
        return all(sequence[index - 1] <= sequence[index] for index in range(1, len(sequence)))

    while len(items) > 1 and not is_sorted(items):
        items = [value for index, value in enumerate(items) if index % 2 == 0]

    return items
