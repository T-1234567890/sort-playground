def slowsort(values):
    values = values[:]

    def sort(left, right):
        if left >= right:
            return

        middle = (left + right) // 2
        sort(left, middle)
        sort(middle + 1, right)

        if values[middle] > values[right]:
            values[middle], values[right] = values[right], values[middle]

        sort(left, right - 1)

    sort(0, len(values) - 1)
    return values
