import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public final class BucketSort {
    private BucketSort() {}

    public static int[] bucketSort(int[] values) {
        if (values.length == 0) {
            return new int[0];
        }

        int minimum = Arrays.stream(values).min().orElse(0);
        int maximum = Arrays.stream(values).max().orElse(0);
        int bucketCount = Math.max(1, (int) Math.sqrt(values.length));
        int range = Math.max(1, maximum - minimum + 1);
        List<List<Integer>> buckets = new ArrayList<>();

        for (int index = 0; index < bucketCount; index += 1) {
            buckets.add(new ArrayList<>());
        }

        for (int value : values) {
            int bucketIndex = Math.min(bucketCount - 1, ((value - minimum) * bucketCount) / range);
            buckets.get(bucketIndex).add(value);
        }

        int[] result = new int[values.length];
        int writeIndex = 0;

        for (List<Integer> bucket : buckets) {
            Collections.sort(bucket);

            for (int value : bucket) {
                result[writeIndex] = value;
                writeIndex += 1;
            }
        }

        return result;
    }
}
