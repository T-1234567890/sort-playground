func heapSort(_ values: [Int]) -> [Int] {
    var heap = values
    let count = heap.count

    guard count > 1 else {
        return heap
    }

    for index in stride(from: count / 2 - 1, through: 0, by: -1) {
        siftDown(&heap, from: index, end: count)
    }

    for end in stride(from: count - 1, through: 1, by: -1) {
        heap.swapAt(0, end)
        siftDown(&heap, from: 0, end: end)
    }

    return heap
}

private func siftDown(_ heap: inout [Int], from start: Int, end: Int) {
    var root = start

    while true {
        let leftChild = root * 2 + 1

        if leftChild >= end {
            return
        }

        var child = leftChild
        let rightChild = leftChild + 1

        if rightChild < end && heap[rightChild] > heap[leftChild] {
            child = rightChild
        }

        if heap[root] >= heap[child] {
            return
        }

        heap.swapAt(root, child)
        root = child
    }
}
