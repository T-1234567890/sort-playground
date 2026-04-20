func mergeSort(_ values: [Int]) -> [Int] {
    guard values.count > 1 else {
        return values
    }

    let middle = values.count / 2
    let left = mergeSort(Array(values[..<middle]))
    let right = mergeSort(Array(values[middle...]))

    return merge(left, right)
}

private func merge(_ left: [Int], _ right: [Int]) -> [Int] {
    var merged: [Int] = []
    var leftIndex = 0
    var rightIndex = 0

    while leftIndex < left.count && rightIndex < right.count {
        if left[leftIndex] <= right[rightIndex] {
            merged.append(left[leftIndex])
            leftIndex += 1
        } else {
            merged.append(right[rightIndex])
            rightIndex += 1
        }
    }

    merged.append(contentsOf: left[leftIndex...])
    merged.append(contentsOf: right[rightIndex...])
    return merged
}
