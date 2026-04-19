def library_sort(values):
    if not values:
        return []

    capacity = len(values) * 2 + 1
    shelf = [None] * capacity
    count = 0

    def compact():
        return [value for value in shelf if value is not None]

    def rebalance():
        nonlocal shelf
        ordered = compact()
        shelf = [None] * capacity

        for index, value in enumerate(ordered):
            slot = ((index + 1) * capacity) // (len(ordered) + 1)
            while shelf[slot] is not None:
                slot += 1
            shelf[slot] = value

    def find_insert_slot(value):
        occupied = [(index, item) for index, item in enumerate(shelf) if item is not None]
        values_only = [item for _, item in occupied]

        left = 0
        right = len(values_only)
        while left < right:
            middle = (left + right) // 2
            if values_only[middle] <= value:
                left = middle + 1
            else:
                right = middle

        if not occupied:
            return capacity // 2

        left_bound = occupied[left - 1][0] if left > 0 else -1
        right_bound = occupied[left][0] if left < len(occupied) else capacity

        for slot in range(left_bound + 1, right_bound):
            if shelf[slot] is None:
                return slot

        return None

    for value in values:
        if count == 0:
            shelf[capacity // 2] = value
            count += 1
            continue

        slot = find_insert_slot(value)
        while slot is None:
            rebalance()
            slot = find_insert_slot(value)

        shelf[slot] = value
        count += 1

    return compact()
