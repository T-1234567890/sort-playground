def quantum_bogosort(values):
    items = values[:]

    for index in range(len(items) - 1, 0, -1):
        swap_index = (index * 7 + 3) % (index + 1)
        items[index], items[swap_index] = items[swap_index], items[index]

    if any(items[index - 1] > items[index] for index in range(1, len(items))):
        items.sort()

    return items
