def heap_sort(values):
    arr = values[:]

    def sift_down(start, end):
        root = start
        while root * 2 + 1 <= end:
            child = root * 2 + 1
            swap_index = root

            if arr[swap_index] < arr[child]:
                swap_index = child

            if child + 1 <= end and arr[swap_index] < arr[child + 1]:
                swap_index = child + 1

            if swap_index == root:
                return

            arr[root], arr[swap_index] = arr[swap_index], arr[root]
            root = swap_index

    for start in range(len(arr) // 2 - 1, -1, -1):
        sift_down(start, len(arr) - 1)

    for end in range(len(arr) - 1, 0, -1):
        arr[0], arr[end] = arr[end], arr[0]
        sift_down(0, end - 1)

    return arr
