def bucket_sort(values):
    values = values[:]

    if not values:
        return values

    minimum = min(values)
    maximum = max(values)
    bucket_count = max(1, int(len(values) ** 0.5))
    range_size = max(1, maximum - minimum + 1)
    buckets = [[] for _ in range(bucket_count)]

    for value in values:
        bucket_index = min(bucket_count - 1, ((value - minimum) * bucket_count) // range_size)
        buckets[bucket_index].append(value)

    result = []
    for bucket in buckets:
        result.extend(sorted(bucket))

    return result
