def stooge_sort(values):
    values = values[:]

    def sort(left, right):
        if left >= right:
            return

        if values[left] > values[right]:
            values[left], values[right] = values[right], values[left]

        if right - left + 1 > 2:
            third = (right - left + 1) // 3
            sort(left, right - third)
            sort(left + third, right)
            sort(left, right - third)

    sort(0, len(values) - 1)
    return values
