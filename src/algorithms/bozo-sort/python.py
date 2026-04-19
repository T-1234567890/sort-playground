import random


def is_sorted(values):
    return all(values[i - 1] <= values[i] for i in range(1, len(values)))


def bozo_sort(values):
    values = values[:]

    while not is_sorted(values):
        i = random.randrange(len(values))
        j = random.randrange(len(values))
        values[i], values[j] = values[j], values[i]

    return values
