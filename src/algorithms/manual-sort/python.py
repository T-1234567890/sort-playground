def manual_sort(values):
    values = values[:]

    while values != sorted(values):
        print("Current:", values)
        source = int(input("Move index: "))
        target = int(input("Drop at index: "))
        item = values.pop(source)
        values.insert(target, item)

    return values
