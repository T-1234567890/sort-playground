import threading
import time


def sleep_sort(values, scale=0.01):
    output = []
    threads = []

    def wake(value):
        time.sleep(value * scale)
        output.append(value)

    for value in values:
        thread = threading.Thread(target=wake, args=(value,))
        thread.start()
        threads.append(thread)

    for thread in threads:
        thread.join()

    return output
