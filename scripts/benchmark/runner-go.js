import { execFileSync } from "node:child_process";
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

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

function mainSource(functionName) {
  return `
package main

import (
  "benchmarktarget/algo"
  "bufio"
  "encoding/json"
  "fmt"
  "os"
  "time"
)

type payload struct {
  DurationMs float64 \`json:"durationMs"\`
  Result []int \`json:"result,omitempty"\`
}

func loadValues(path string) []int {
  file, err := os.Open(path)
  if err != nil {
    panic(err)
  }
  defer file.Close()

  values := []int{}
  scanner := bufio.NewScanner(file)
  for scanner.Scan() {
    var value int
    fmt.Sscanf(scanner.Text(), "%d", &value)
    values = append(values, value)
  }
  if err := scanner.Err(); err != nil {
    panic(err)
  }
  return values
}

func isSorted(values []int) bool {
  for index := 1; index < len(values); index++ {
    if values[index-1] > values[index] {
      return false
    }
  }
  return true
}

func main() {
  datasetPath := os.Args[1]
  mode := os.Args[2]
  values := loadValues(datasetPath)

  started := time.Now()
  result := algo.${functionName}(values)
  durationMs := time.Since(started).Seconds() * 1000.0

  if !isSorted(result) {
    panic("Go benchmark result was not sorted.")
  }

  response := payload{DurationMs: durationMs}
  if mode == "full" {
    response.Result = result
  }

  encoded, err := json.Marshal(response)
  if err != nil {
    panic(err)
  }
  fmt.Println(string(encoded))
}
`;
}

export async function createGoRunner({ root, tempDir, algorithmsDir, slug, goCommand = "go" }) {
  const snippetPath = path.join(algorithmsDir, slug, "go.go");
  const packageDir = path.join(tempDir, "algo");
  const wrapperDir = path.join(tempDir, "cmd");
  const functionName = slugToPascalCase(slug);
  const snippetSource = await readFile(snippetPath, "utf8");

  await mkdir(packageDir, { recursive: true });
  await mkdir(wrapperDir, { recursive: true });
  await writeFile(path.join(tempDir, "go.mod"), "module benchmarktarget\n\ngo 1.22\n");
  await writeFile(path.join(packageDir, "algorithm.go"), snippetSource);
  await writeFile(path.join(wrapperDir, "main.go"), mainSource(functionName));

  const executablePath = path.join(tempDir, `${slug}-go-runner`);
  runCommand(goCommand, ["build", "-o", executablePath, "./cmd"], tempDir);

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
