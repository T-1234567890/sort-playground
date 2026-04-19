import { execFileSync } from "node:child_process";
import path from "node:path";
import { writeFile } from "node:fs/promises";

const cCallConfig = {
  "quick-sort": { mode: "low-high", type: "int" },
  "merge-sort": { mode: "low-high", type: "int" },
  "bead-sort": { mode: "length", type: "unsigned int" },
};

function runCommand(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function slugToFunctionName(slug) {
  return slug.replace(/-/g, "_");
}

function cRunnerSource(snippetPath, slug) {
  const functionName = slugToFunctionName(slug);
  const config = cCallConfig[slug] ?? { mode: "length", type: "int" };
  const scanFormat = config.type === "unsigned int" ? "%u" : "%d";
  const invoke = config.mode === "low-high"
    ? `if (length > 0) { ${functionName}(copy, 0, length - 1); }`
    : `${functionName}(copy, length);`;

  return `
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#include ${JSON.stringify(snippetPath)}

typedef ${config.type} value_t;

static value_t *load_values(const char *path, int *length) {
    FILE *file = fopen(path, "r");
    if (!file) {
        perror("fopen");
        exit(1);
    }

    int capacity = 128;
    int count = 0;
    value_t *values = malloc((size_t) capacity * sizeof(value_t));

    value_t value;
    while (fscanf(file, "${scanFormat}", &value) == 1) {
        if (count == capacity) {
            capacity *= 2;
            values = realloc(values, (size_t) capacity * sizeof(value_t));
        }
        values[count++] = value;
    }

    fclose(file);
    *length = count;
    return values;
}

static double now_ms(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ((double) ts.tv_sec * 1000.0) + ((double) ts.tv_nsec / 1000000.0);
}

static int is_sorted(const value_t values[], int length) {
    for (int index = 1; index < length; index++) {
        if (values[index - 1] > values[index]) {
            return 0;
        }
    }
    return 1;
}

int main(int argc, char **argv) {
    if (argc != 3) {
        fprintf(stderr, "Expected dataset path and mode.\\n");
        return 1;
    }

    int length = 0;
    value_t *values = load_values(argv[1], &length);
    const char *mode = argv[2];
    value_t *copy = malloc((size_t) length * sizeof(value_t));
    memcpy(copy, values, (size_t) length * sizeof(value_t));

    double started = now_ms();
    ${invoke}
    double finished = now_ms();

    if (!is_sorted(copy, length)) {
        fprintf(stderr, "C benchmark result was not sorted.\\n");
        return 1;
    }

    if (strcmp(mode, "full") == 0) {
        printf("{\\"durationMs\\":%.6f,\\"result\\":[", finished - started);
        for (int index = 0; index < length; index++) {
            if (index > 0) {
                printf(",");
            }
            printf("${config.type === "unsigned int" ? "%u" : "%d"}", copy[index]);
        }
        printf("]}\\n");
    } else {
        printf("{\\"durationMs\\":%.6f}\\n", finished - started);
    }

    free(copy);
    free(values);
    return 0;
}
`;
}

export async function createCRunner({ root, tempDir, algorithmsDir, slug, cCommand = "cc" }) {
  const snippetPath = path.join(algorithmsDir, slug, "c.c");
  const sourcePath = path.join(tempDir, `${slug}-c-runner.c`);
  const executablePath = path.join(tempDir, `${slug}-c-runner`);
  await writeFile(sourcePath, cRunnerSource(snippetPath, slug));
  runCommand(cCommand, ["-O2", sourcePath, "-o", executablePath], root);

  function run(datasetPath, mode) {
    return JSON.parse(runCommand(executablePath, [datasetPath, mode], root));
  }

  return {
    async runWithResult(datasetPath) {
      return run(datasetPath, "full");
    },
    async measure(datasetPath) {
      return run(datasetPath, "time");
    },
  };
}
