def odd_even_merge_sort(values):
    items = values[:]

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
    return items
