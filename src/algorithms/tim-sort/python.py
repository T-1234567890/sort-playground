RUN = 32


def _insertion_sort(values, left, right):
    for index in range(left + 1, right + 1):
        value = values[index]
        pointer = index - 1

        while pointer >= left and values[pointer] > value:
            values[pointer + 1] = values[pointer]
            pointer -= 1

        values[pointer + 1] = value


def _merge(values, left, middle, right):
    left_slice = values[left : middle + 1]
    right_slice = values[middle + 1 : right + 1]
    left_index = 0
    right_index = 0
    target = left

    while left_index < len(left_slice) and right_index < len(right_slice):
        if left_slice[left_index] <= right_slice[right_index]:
            values[target] = left_slice[left_index]
            left_index += 1
        else:
            values[target] = right_slice[right_index]
            right_index += 1
        target += 1

    while left_index < len(left_slice):
        values[target] = left_slice[left_index]
        left_index += 1
        target += 1

    while right_index < len(right_slice):
        values[target] = right_slice[right_index]
        right_index += 1
        target += 1


def tim_sort(values):
    values = values[:]
    length = len(values)

    for start in range(0, length, RUN):
        _insertion_sort(values, start, min(start + RUN - 1, length - 1))

    size = RUN
    while size < length:
        for left in range(0, length, size * 2):
            middle = min(left + size - 1, length - 1)
            right = min(left + size * 2 - 1, length - 1)

            if middle < right:
                _merge(values, left, middle, right)

        size *= 2

    return values
