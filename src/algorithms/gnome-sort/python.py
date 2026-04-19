def gnome_sort(values):
    values = values[:]
    index = 1

    while index < len(values):
        if values[index - 1] <= values[index]:
            index += 1
        else:
            values[index - 1], values[index] = values[index], values[index - 1]
            index = max(1, index - 1)

    return values
