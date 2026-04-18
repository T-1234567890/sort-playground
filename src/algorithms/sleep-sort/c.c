#include <pthread.h>
#include <stddef.h>
#include <unistd.h>

typedef struct {
    int value;
    int *output;
    size_t *count;
    pthread_mutex_t *lock;
} SleepJob;

static void *wake(void *arg) {
    SleepJob *job = (SleepJob *)arg;
    usleep((useconds_t)job->value * 10000);

    pthread_mutex_lock(job->lock);
    job->output[(*job->count)++] = job->value;
    pthread_mutex_unlock(job->lock);

    return NULL;
}

void sleep_sort(int values[], size_t length, int output[]) {
    if (length == 0) {
        return;
    }

    pthread_t threads[length];
    SleepJob jobs[length];
    size_t count = 0;
    pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;

    for (size_t i = 0; i < length; i++) {
        jobs[i] = (SleepJob){values[i], output, &count, &lock};
        pthread_create(&threads[i], NULL, wake, &jobs[i]);
    }

    for (size_t i = 0; i < length; i++) {
        pthread_join(threads[i], NULL);
    }

    pthread_mutex_destroy(&lock);
}
