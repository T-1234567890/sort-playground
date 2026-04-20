import { execFileSync } from "node:child_process";
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";

function runCommand(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function slugToPascalCase(slug) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function slugToCamelCase(slug) {
  const [first = "", ...rest] = slug.split("-");
  return `${first}${rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("")}`;
}

function runnerSource(className, functionName) {
  return `
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.stream.Collectors;

public final class BenchmarkMain {
    private static int[] loadValues(String datasetPath) throws Exception {
        return Files.readAllLines(Path.of(datasetPath)).stream()
            .filter(line -> !line.isBlank())
            .mapToInt(Integer::parseInt)
            .toArray();
    }

    private static boolean isSorted(int[] values) {
        for (int index = 1; index < values.length; index++) {
            if (values[index - 1] > values[index]) {
                return false;
            }
        }
        return true;
    }

    private static String encode(int[] values) {
        return Arrays.stream(values)
            .mapToObj(Integer::toString)
            .collect(Collectors.joining(","));
    }

    public static void main(String[] args) throws Exception {
        String datasetPath = args[0];
        String mode = args[1];
        int[] values = loadValues(datasetPath);

        long started = System.nanoTime();
        int[] result = ${className}.${functionName}(Arrays.copyOf(values, values.length));
        double durationMs = (System.nanoTime() - started) / 1_000_000.0;

        if (result == null || !isSorted(result)) {
            throw new RuntimeException("Java benchmark result was not sorted.");
        }

        if ("full".equals(mode)) {
            System.out.printf("{\\"durationMs\\":%.6f,\\"result\\":[%s]}%n", durationMs, encode(result));
        } else {
            System.out.printf("{\\"durationMs\\":%.6f}%n", durationMs);
        }
    }
}
`;
}

export async function createJavaRunner({ root, tempDir, algorithmsDir, slug, javacCommand = "javac", javaCommand = "java" }) {
  const className = slugToPascalCase(slug);
  const functionName = slugToCamelCase(slug);
  const snippetPath = path.join(algorithmsDir, slug, "java.java");
  const snippetSource = await readFile(snippetPath, "utf8");
  const classPath = path.join(tempDir, `${className}.java`);
  const runnerPath = path.join(tempDir, "BenchmarkMain.java");

  await writeFile(classPath, snippetSource);
  await writeFile(runnerPath, runnerSource(className, functionName));
  runCommand(javacCommand, [classPath, runnerPath], root);

  function run(datasetPath, mode) {
    return JSON.parse(runCommand(javaCommand, ["-cp", tempDir, "BenchmarkMain", datasetPath, mode], root));
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
