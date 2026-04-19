def smoothsort(values):
    items = values[:]

    def sift_down(start, end):
        root = start

        while root * 2 + 1 <= end:
            child = root * 2 + 1
            candidate = root

            if items[candidate] < items[child]:
                candidate = child

            if child + 1 <= end and items[candidate] < items[child + 1]:
                candidate = child + 1

            if candidate == root:
                return

            items[root], items[candidate] = items[candidate], items[root]
            root = candidate

    for start in range(len(items) // 2 - 1, -1, -1):
        sift_down(start, len(items) - 1)

    for end in range(len(items) - 1, 0, -1):
        items[0], items[end] = items[end], items[0]
        sift_down(0, end - 1)

    return items
