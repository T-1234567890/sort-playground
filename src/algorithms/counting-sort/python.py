def counting_sort(values):
    if not values:
        return []

    minimum = min(values)
    maximum = max(values)
    counts = [0] * (maximum - minimum + 1)

    for value in values:
        counts[value - minimum] += 1

    result = []
    for offset, count in enumerate(counts):
        result.extend([offset + minimum] * count)

    return result
