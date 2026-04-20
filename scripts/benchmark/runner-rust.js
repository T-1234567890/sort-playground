import { execFileSync } from "node:child_process";
import path from "node:path";
import { writeFile } from "node:fs/promises";

const rustCallConfig = {
  "merge-sort": { mode: "return-vec", type: "i32" },
  "bead-sort": { mode: "return-vec", type: "usize" },
  "bucket-sort": { mode: "return-vec", type: "i32" },
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

function rustRunnerSource(snippetPath, slug) {
  const functionName = slugToFunctionName(slug);
  const config = rustCallConfig[slug] ?? { mode: "mut-slice", type: "i32" };
  const parser = config.type === "usize" ? "value.parse::<usize>().unwrap()" : "value.parse::<i32>().unwrap()";
  const sortableCall = config.mode === "return-vec"
    ? `${functionName}(&values)`
    : `{ let mut copy = values.to_vec(); ${functionName}(&mut copy); copy }`;

  return `
use std::env;
use std::fs;
use std::time::Instant;

include!(${JSON.stringify(snippetPath)});

fn load_values(path: &str) -> Vec<${config.type}> {
    fs::read_to_string(path)
        .unwrap()
        .lines()
        .filter(|line| !line.trim().is_empty())
        .map(|value| ${parser})
        .collect()
}

fn is_sorted(values: &[${config.type}]) -> bool {
    values.windows(2).all(|window| window[0] <= window[1])
}

fn main() {
    let args: Vec<String> = env::args().collect();
    let values = load_values(&args[1]);
    let mode = &args[2];
    let started = Instant::now();
    let result = ${sortableCall};
    let duration_ms = started.elapsed().as_secs_f64() * 1000.0;

    if !is_sorted(&result) {
        panic!("Rust benchmark result was not sorted.");
    }

    if mode == "full" {
        let values = result
            .iter()
            .map(|value| value.to_string())
            .collect::<Vec<String>>()
            .join(",");
        println!("{{\\"durationMs\\":{:.6},\\"result\\":[{}]}}", duration_ms, values);
    } else {
        println!("{{\\"durationMs\\":{:.6}}}", duration_ms);
    }
}
`;
}

export async function createRustRunner({ root, tempDir, algorithmsDir, slug, rustCommand = "rustc" }) {
  const snippetPath = path.join(algorithmsDir, slug, "rust.rs");
  const sourcePath = path.join(tempDir, `${slug}-rust-runner.rs`);
  const executablePath = path.join(tempDir, `${slug}-rust-runner`);
  await writeFile(sourcePath, rustRunnerSource(snippetPath, slug));
  runCommand(rustCommand, ["-O", sourcePath, "-o", executablePath], root);

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
