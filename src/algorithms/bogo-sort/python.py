import random


def bogo_sort(values):
    items = values[:]

    def is_sorted():
        return all(items[i - 1] <= items[i] for i in range(1, len(items)))

    while not is_sorted():
        random.shuffle(items)

    return items
