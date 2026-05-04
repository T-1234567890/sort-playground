def pancake_sort(values):
    values = values[:]

    def reverse_prefix(end):
        left = 0
        right = end
        while left < right:
            values[left], values[right] = values[right], values[left]
            left += 1
            right -= 1

    for size in range(len(values), 1, -1):
        max_index = 0
        for i in range(1, size):
            if values[i] > values[max_index]:
                max_index = i

        if max_index == size - 1:
            continue

        if max_index > 0:
            reverse_prefix(max_index)

        reverse_prefix(size - 1)

    return values
