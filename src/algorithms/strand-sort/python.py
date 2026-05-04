def merge(left, right):
    result = []
    i = 0
    j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    return result + left[i:] + right[j:]


def strand_sort(values):
    unsorted = values[:]
    result = []

    while unsorted:
        strand = [unsorted.pop(0)]
        remaining = []

        for value in unsorted:
            if value >= strand[-1]:
                strand.append(value)
            else:
                remaining.append(value)

        result = merge(result, strand)
        unsorted = remaining

    return result
