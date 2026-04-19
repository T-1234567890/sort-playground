pub fn manual_sort(values: &mut Vec<i32>, source: usize, target: usize) {
    if source >= values.len() || target >= values.len() || source == target {
        return;
    }

    let item = values.remove(source);
    values.insert(target, item);
}
