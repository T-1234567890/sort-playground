def intro_sort(values):
    arr = values[:]

    def insertion_sort(start, end):
        for index in range(start + 1, end + 1):
            value = arr[index]
            position = index - 1
            while position >= start and arr[position] > value:
                arr[position + 1] = arr[position]
                position -= 1
            arr[position + 1] = value

    def sift_down(start, end, offset):
        root = start
        while root * 2 + 1 <= end:
            child = root * 2 + 1
            swap_index = root

            if arr[offset + swap_index] < arr[offset + child]:
                swap_index = child

            if child + 1 <= end and arr[offset + swap_index] < arr[offset + child + 1]:
                swap_index = child + 1

            if swap_index == root:
                return

            arr[offset + root], arr[offset + swap_index] = arr[offset + swap_index], arr[offset + root]
            root = swap_index

    def heap_sort(start, end):
        length = end - start + 1
        for root in range(length // 2 - 1, -1, -1):
            sift_down(root, length - 1, start)

        for tail in range(length - 1, 0, -1):
            arr[start], arr[start + tail] = arr[start + tail], arr[start]
            sift_down(0, tail - 1, start)

    def partition(low, high):
        pivot = arr[high]
        store = low
        for index in range(low, high):
            if arr[index] <= pivot:
                arr[store], arr[index] = arr[index], arr[store]
                store += 1
        arr[store], arr[high] = arr[high], arr[store]
        return store

    def sort(low, high, depth_limit):
        length = high - low + 1
        if length <= 1:
            return
        if length <= 16:
            insertion_sort(low, high)
            return
        if depth_limit == 0:
            heap_sort(low, high)
            return

        pivot_index = partition(low, high)
        sort(low, pivot_index - 1, depth_limit - 1)
        sort(pivot_index + 1, high, depth_limit - 1)

    depth_limit = max(len(arr).bit_length() - 1, 1) * 2
    sort(0, len(arr) - 1, depth_limit)
    return arr
