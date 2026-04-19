void gnome_sort(int values[], int length) {
    int index = 1;

    while (index < length) {
        if (values[index - 1] <= values[index]) {
            index++;
        } else {
            int temp = values[index - 1];
            values[index - 1] = values[index];
            values[index] = temp;
            index--;
            if (index < 1) {
                index = 1;
            }
        }
    }
}
