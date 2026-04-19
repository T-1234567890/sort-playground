def bead_sort(values):
    values = [max(0, int(value)) for value in values]
    if not values:
        return values

    max_value = max(values)
    beads = [0] * max_value

    for value in values:
        for bead in range(value):
            beads[bead] += 1

    result = [0] * len(values)
    for row in range(len(values) - 1, -1, -1):
        for bead in range(max_value):
            if beads[bead] > 0:
                result[row] += 1
                beads[bead] -= 1

    return result
