def cycle_sort(values):
    items = values[:]
    length = len(items)

    for cycle_start in range(length - 1):
        item = items[cycle_start]
        position = cycle_start

        for index in range(cycle_start + 1, length):
            if items[index] < item:
                position += 1

        if position == cycle_start:
            continue

        while item == items[position]:
            position += 1

        items[position], item = item, items[position]

        while position != cycle_start:
            position = cycle_start

            for index in range(cycle_start + 1, length):
                if items[index] < item:
                    position += 1

            while item == items[position]:
                position += 1

            items[position], item = item, items[position]

    return items
