use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

pub fn sleep_sort(values: &[u64], scale_ms: u64) -> Vec<u64> {
    let output = Arc::new(Mutex::new(Vec::new()));
    let mut handles = Vec::new();

    for &value in values {
        let output = Arc::clone(&output);
        handles.push(thread::spawn(move || {
            thread::sleep(Duration::from_millis(value * scale_ms));
            output.lock().unwrap().push(value);
        }));
    }

    for handle in handles {
        handle.join().unwrap();
    }

    Arc::try_unwrap(output).unwrap().into_inner().unwrap()
}
