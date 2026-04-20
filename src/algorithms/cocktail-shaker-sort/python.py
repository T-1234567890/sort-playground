def cocktail_shaker_sort(values):
    values = values[:]
    start = 0
    end = len(values) - 1
    swapped = True

    while swapped:
        swapped = False

        for index in range(start, end):
            if values[index] > values[index + 1]:
                values[index], values[index + 1] = values[index + 1], values[index]
                swapped = True

        if not swapped:
            break

        swapped = False
        end -= 1

        for index in range(end, start, -1):
            if values[index - 1] > values[index]:
                values[index - 1], values[index] = values[index], values[index - 1]
                swapped = True

        start += 1

    return values
