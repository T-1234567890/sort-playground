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

function slugToCamelCase(slug) {
  const [first = "", ...rest] = slug.split("-");
  return `${first}${rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("")}`;
}

function runnerSource(functionName) {
  return `
import java.io.File

fun loadValues(datasetPath: String): IntArray =
  File(datasetPath)
    .readLines()
    .filter { it.isNotBlank() }
    .map { it.toInt() }
    .toIntArray()

fun isSorted(values: IntArray): Boolean {
  for (index in 1 until values.size) {
    if (values[index - 1] > values[index]) {
      return false
    }
  }
  return true
}

fun main(args: Array<String>) {
  val datasetPath = args[0]
  val mode = args[1]
  val values = loadValues(datasetPath)

  val started = System.nanoTime()
  val result = ${functionName}(values.copyOf())
  val durationMs = (System.nanoTime() - started) / 1_000_000.0

  if (!isSorted(result)) {
    error("Kotlin benchmark result was not sorted.")
  }

  if (mode == "full") {
    val encoded = result.joinToString(",")
    println("{\\"durationMs\\":$durationMs,\\"result\\":[$encoded]}")
  } else {
    println("{\\"durationMs\\":$durationMs}")
  }
}
`;
}

export async function createKotlinRunner({ root, tempDir, algorithmsDir, slug, kotlinCommand = "kotlinc", javaCommand = "java" }) {
  const snippetPath = path.join(algorithmsDir, slug, "kt.kt");
  const sourcePath = path.join(tempDir, `${slug}-kotlin-runner.kt`);
  const executablePath = path.join(tempDir, `${slug}-kotlin-runner.jar`);
  const functionName = slugToCamelCase(slug);
  const snippetSource = await readFile(snippetPath, "utf8");

  await writeFile(sourcePath, `${snippetSource}\n\n${runnerSource(functionName)}`);
  runCommand(kotlinCommand, [sourcePath, "-include-runtime", "-d", executablePath], root);

  function run(datasetPath, mode) {
    return JSON.parse(runCommand(javaCommand, ["-jar", executablePath, datasetPath, mode], root));
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
