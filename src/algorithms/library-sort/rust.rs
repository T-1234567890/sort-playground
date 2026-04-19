fn compact(shelf: &[Option<i32>]) -> Vec<i32> {
    shelf.iter().filter_map(|value| *value).collect()
}

fn rebalance(shelf: &mut Vec<Option<i32>>) {
    let ordered = compact(shelf);
    let capacity = shelf.len();
    shelf.clear();
    shelf.resize(capacity, None);

    for (index, value) in ordered.iter().enumerate() {
        let mut slot = ((index + 1) * capacity) / (ordered.len() + 1);
        while shelf[slot].is_some() {
            slot += 1;
        }
        shelf[slot] = Some(*value);
    }
}

fn find_insert_slot(shelf: &[Option<i32>], value: i32) -> Option<usize> {
    let occupied: Vec<(usize, i32)> = shelf
        .iter()
        .enumerate()
        .filter_map(|(index, item)| item.map(|actual| (index, actual)))
        .collect();

    if occupied.is_empty() {
        return Some(shelf.len() / 2);
    }

    let mut left = 0usize;
    let mut right = occupied.len();

    while left < right {
        let middle = (left + right) / 2;
        if occupied[middle].1 <= value {
            left = middle + 1;
        } else {
            right = middle;
        }
    }

    let left_bound = if left > 0 { occupied[left - 1].0 as isize } else { -1 };
    let right_bound = if left < occupied.len() {
        occupied[left].0 as isize
    } else {
        shelf.len() as isize
    };

    ((left_bound + 1) as usize..right_bound as usize).find(|&slot| shelf[slot].is_none())
}

pub fn library_sort(values: &mut [i32]) {
    if values.is_empty() {
        return;
    }

    let capacity = values.len() * 2 + 1;
    let mut shelf = vec![None; capacity];
    let mut count = 0usize;

    for value in values.iter().copied() {
        if count == 0 {
            shelf[capacity / 2] = Some(value);
            count += 1;
            continue;
        }

        let mut slot = find_insert_slot(&shelf, value);
        while slot.is_none() {
            rebalance(&mut shelf);
            slot = find_insert_slot(&shelf, value);
        }

        shelf[slot.unwrap()] = Some(value);
        count += 1;
    }

    for (index, value) in compact(&shelf).into_iter().enumerate() {
        values[index] = value;
    }
}
