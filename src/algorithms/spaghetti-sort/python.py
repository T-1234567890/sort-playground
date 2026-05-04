def spaghetti_sort(values):
    values = values[:]

    for end in range(len(values) - 1, 0, -1):
        longest = 0
        for i in range(1, end + 1):
            if values[i] > values[longest]:
                longest = i

        values[longest], values[end] = values[end], values[longest]

    return values
