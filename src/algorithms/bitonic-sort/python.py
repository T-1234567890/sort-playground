def bitonic_sort(values):
    items = values[:]

    def greatest_power_of_two_less_than(length):
        power = 1
        while power < length:
            power <<= 1
        return power >> 1

    def merge(start, length, ascending):
        if length <= 1:
            return

        step = greatest_power_of_two_less_than(length)
        for index in range(start, start + length - step):
            partner = index + step
            if (ascending and items[index] > items[partner]) or (not ascending and items[index] < items[partner]):
                items[index], items[partner] = items[partner], items[index]

        merge(start, step, ascending)
        merge(start + step, length - step, ascending)

    def sort(start, length, ascending):
        if length <= 1:
            return

        half = length // 2
        sort(start, half, True)
        sort(start + half, length - half, False)
        merge(start, length, ascending)

    sort(0, len(items), True)
    return items
