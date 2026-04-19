def quick_sort(values):
    items = values[:]

    def median_of_three(low, high):
        mid = (low + high) // 2

        if items[low] > items[mid]:
            items[low], items[mid] = items[mid], items[low]
        if items[low] > items[high]:
            items[low], items[high] = items[high], items[low]
        if items[mid] > items[high]:
            items[mid], items[high] = items[high], items[mid]

        items[mid], items[high] = items[high], items[mid]
        return items[high]

    def partition(low, high):
        pivot = median_of_three(low, high)
        i = low
        for j in range(low, high):
            if items[j] <= pivot:
                items[i], items[j] = items[j], items[i]
                i += 1
        items[i], items[high] = items[high], items[i]
        return i

    def sort(low, high):
        while low < high:
            pivot_index = partition(low, high)
            if pivot_index - low < high - pivot_index:
                sort(low, pivot_index - 1)
                low = pivot_index + 1
            else:
                sort(pivot_index + 1, high)
                high = pivot_index - 1

    sort(0, len(items) - 1)
    return items
