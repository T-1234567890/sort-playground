def odd_even_merge_sort(values):
    if not values:
        return []

    pad_value = max(values) + 1
    length = 1
    while length < len(values):
        length <<= 1

    items = values[:] + [pad_value] * (length - len(values))

    def compare_and_swap(left, right):
        if items[left] > items[right]:
            items[left], items[right] = items[right], items[left]

    def merge(start, length, gap):
        step = gap * 2

        if step < length:
            merge(start, length, step)
            merge(start + gap, length, step)

            for index in range(start + gap, start + length - gap, step):
                compare_and_swap(index, index + gap)
        elif start + gap < start + length:
            compare_and_swap(start, start + gap)

    def sort(start, length):
        if length <= 1:
            return

        half = length // 2
        sort(start, half)
        sort(start + half, length - half)
        merge(start, length, 1)

    sort(0, len(items))
    return items[:len(values)]
