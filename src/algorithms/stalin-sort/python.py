def stalin_sort(values):
    if not values:
        return []

    survivors = [values[0]]
    for value in values[1:]:
        if value >= survivors[-1]:
            survivors.append(value)

    return survivors
