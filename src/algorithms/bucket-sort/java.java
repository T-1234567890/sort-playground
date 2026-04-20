import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class BucketSortExample {
    private BucketSortExample() {}

    public static List<Integer> bucketSort(List<Integer> values) {
        if (values.isEmpty()) {
            return new ArrayList<>();
        }

        int minimum = Collections.min(values);
        int maximum = Collections.max(values);
        int bucketCount = Math.max(1, (int) Math.sqrt(values.size()));
        int range = Math.max(1, maximum - minimum + 1);
        List<List<Integer>> buckets = new ArrayList<>();

        for (int index = 0; index < bucketCount; index += 1) {
            buckets.add(new ArrayList<>());
        }

        for (int value : values) {
            int bucketIndex = Math.min(bucketCount - 1, ((value - minimum) * bucketCount) / range);
            buckets.get(bucketIndex).add(value);
        }

        List<Integer> result = new ArrayList<>(values.size());
        for (List<Integer> bucket : buckets) {
            Collections.sort(bucket);
            result.addAll(bucket);
        }

        return result;
    }
}
