package bubblesort

func BubbleSort(values []int) []int {
	array := make([]int, len(values))
	copy(array, values)

	for end := len(array) - 1; end > 0; end-- {
		for index := 0; index < end; index++ {
			if array[index] > array[index+1] {
				array[index], array[index+1] = array[index+1], array[index]
			}
		}
	}

	return array
}
