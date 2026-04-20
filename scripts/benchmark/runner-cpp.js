import { execFileSync } from "node:child_process";
import path from "node:path";
import { writeFile } from "node:fs/promises";

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

function cppRunnerSource(snippetPath, slug) {
  const functionName = slugToCamelCase(slug);

  return `
#include <chrono>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#include ${JSON.stringify(snippetPath)}

static std::vector<int> loadValues(const std::string& datasetPath) {
    std::ifstream file(datasetPath);
    std::vector<int> values;
    int value = 0;

    while (file >> value) {
        values.push_back(value);
    }

    return values;
}

static bool isSorted(const std::vector<int>& values) {
    for (std::size_t index = 1; index < values.size(); index++) {
        if (values[index - 1] > values[index]) {
            return false;
        }
    }
    return true;
}

static std::string encode(const std::vector<int>& values) {
    std::ostringstream stream;
    for (std::size_t index = 0; index < values.size(); index++) {
        if (index > 0) {
            stream << ",";
        }
        stream << values[index];
    }
    return stream.str();
}

int main(int argc, char** argv) {
    if (argc != 3) {
        return 1;
    }

    std::string datasetPath = argv[1];
    std::string mode = argv[2];
    std::vector<int> values = loadValues(datasetPath);

    auto started = std::chrono::steady_clock::now();
    std::vector<int> result = ${functionName}(values);
    double durationMs = std::chrono::duration<double, std::milli>(std::chrono::steady_clock::now() - started).count();

    if (!isSorted(result)) {
        throw std::runtime_error("C++ benchmark result was not sorted.");
    }

    if (mode == "full") {
        std::cout << "{\\"durationMs\\":" << durationMs << ",\\"result\\":[" << encode(result) << "]}" << std::endl;
    } else {
        std::cout << "{\\"durationMs\\":" << durationMs << "}" << std::endl;
    }

    return 0;
}
`;
}

export async function createCppRunner({ root, tempDir, algorithmsDir, slug, cppCommand = "g++" }) {
  const snippetPath = path.join(algorithmsDir, slug, "cpp.cpp");
  const sourcePath = path.join(tempDir, `${slug}-cpp-runner.cpp`);
  const executablePath = path.join(tempDir, `${slug}-cpp-runner`);
  await writeFile(sourcePath, cppRunnerSource(snippetPath, slug));
  runCommand(cppCommand, ["-std=c++17", "-O2", sourcePath, "-o", executablePath], root);

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
