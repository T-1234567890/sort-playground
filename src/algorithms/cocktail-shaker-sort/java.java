import java.util.ArrayList;
import java.util.List;

public final class CocktailShakerSortExample {
    private CocktailShakerSortExample() {}

    public static List<Integer> cocktailShakerSort(List<Integer> values) {
        List<Integer> result = new ArrayList<>(values);
        boolean swapped = true;
        int start = 0;
        int end = result.size() - 1;

        while (swapped) {
            swapped = false;

            for (int index = start; index < end; index += 1) {
                if (result.get(index) > result.get(index + 1)) {
                    int temp = result.get(index);
                    result.set(index, result.get(index + 1));
                    result.set(index + 1, temp);
                    swapped = true;
                }
            }

            if (!swapped) {
                break;
            }

            swapped = false;
            end -= 1;

            for (int index = end - 1; index >= start; index -= 1) {
                if (result.get(index) > result.get(index + 1)) {
                    int temp = result.get(index);
                    result.set(index, result.get(index + 1));
                    result.set(index + 1, temp);
                    swapped = true;
                }
            }

            start += 1;
        }

        return result;
    }
}
