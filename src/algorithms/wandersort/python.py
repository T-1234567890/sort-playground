import random


def wandersort(values):
    values = values[:]

    def sorted_enough(items):
        return all(items[i - 1] <= items[i] for i in range(1, len(items)))

    while not sorted_enough(values):
        left, right = random.sample(range(len(values)), 2)
        if left > right:
            left, right = right, left

        if values[left] > values[right]:
            values[left], values[right] = values[right], values[left]

    return values
