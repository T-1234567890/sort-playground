def quick_sort(values):
    items = values[:]

    def partition(low, high):
        pivot = items[high]
        i = low
        for j in range(low, high):
            if items[j] <= pivot:
                items[i], items[j] = items[j], items[i]
                i += 1
        items[i], items[high] = items[high], items[i]
        return i

    def sort(low, high):
        if low < high:
            pivot_index = partition(low, high)
            sort(low, pivot_index - 1)
            sort(pivot_index + 1, high)

    sort(0, len(items) - 1)
    return items
