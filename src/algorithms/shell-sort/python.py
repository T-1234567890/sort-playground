def shell_sort(values):
    arr = values[:]
    gap = len(arr) // 2

    while gap > 0:
        for index in range(gap, len(arr)):
            value = arr[index]
            position = index

            while position >= gap and arr[position - gap] > value:
                arr[position] = arr[position - gap]
                position -= gap

            arr[position] = value

        gap //= 2

    return arr
