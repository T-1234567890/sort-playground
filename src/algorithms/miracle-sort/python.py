import time


def is_sorted(values):
    return all(values[i - 1] <= values[i] for i in range(1, len(values)))


def miracle_sort(values):
    values = values[:]

    while not is_sorted(values):
        time.sleep(1)

    return values
