import java.util.Arrays;

public final class CocktailShakerSort {
    private CocktailShakerSort() {}

    public static int[] cocktailShakerSort(int[] values) {
        int[] result = Arrays.copyOf(values, values.length);
        boolean swapped = true;
        int start = 0;
        int end = result.length - 1;

        while (swapped) {
            swapped = false;

            for (int index = start; index < end; index += 1) {
                if (result[index] > result[index + 1]) {
                    int temp = result[index];
                    result[index] = result[index + 1];
                    result[index + 1] = temp;
                    swapped = true;
                }
            }

            if (!swapped) {
                break;
            }

            swapped = false;
            end -= 1;

            for (int index = end - 1; index >= start; index -= 1) {
                if (result[index] > result[index + 1]) {
                    int temp = result[index];
                    result[index] = result[index + 1];
                    result[index + 1] = temp;
                    swapped = true;
                }
            }

            start += 1;
        }

        return result;
    }
}
