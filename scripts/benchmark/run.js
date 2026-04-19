import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { benchmarkIterations } from "./benchmark.js";
import { benchmarkProfiles, benchmarkSizes, createDatasets, writeDatasets } from "./dataset.js";
import { buildEnvironmentSnapshot, buildHarnessSnapshot } from "./output.js";
import { createPythonRunner } from "./runner-python.js";
import { createRustRunner } from "./runner-rust.js";
import { createCRunner } from "./runner-c.js";
import { assertSorted } from "./validator.js";
import {
  algorithmsDir,
  createAlgorithmHash,
  hasThreeLanguageSupport,
  hasTool,
  inferBenchmarkDecision,
  loadAlgorithms,
  root,
  tryRunCommand,
} from "./catalog.js";

const toolchain = {
  python: "python3",
  rust: "rustc",
  c: "cc",
};

const slug = process.env.ALGORITHM;
const language = process.env.LANGUAGE;
const outputPath = process.env.OUTPUT_PATH || `benchmark-${slug}-${language}.json`;

function logBenchmark(message) {
  console.log(`[benchmark] ${message}`);
}

function assertGitHubActions() {
  if (process.env.GITHUB_ACTIONS !== "true") {
    throw new Error("Benchmark data is CI-only. Run this script from GitHub Actions.");
  }
}

async function createRunner(tempDir, selectedSlug, selectedLanguage) {
  if (selectedLanguage === "python") {
    return createPythonRunner({ root, tempDir, algorithmsDir, slug: selectedSlug, pythonCommand: toolchain.python });
  }

  if (selectedLanguage === "rust") {
    return createRustRunner({ root, tempDir, algorithmsDir, slug: selectedSlug, rustCommand: toolchain.rust });
  }

  if (selectedLanguage === "c") {
    return createCRunner({ root, tempDir, algorithmsDir, slug: selectedSlug, cCommand: toolchain.c });
  }

  throw new Error(`Unsupported benchmark language: ${selectedLanguage}`);
}

async function main() {
  assertGitHubActions();

  if (!slug || !language) {
    throw new Error("ALGORITHM and LANGUAGE environment variables are required.");
  }

  for (const [toolLanguage, command] of Object.entries(toolchain)) {
    if (!hasTool(command)) {
      throw new Error(`Missing required ${toolLanguage} toolchain: ${command}`);
    }
  }

  const algorithms = await loadAlgorithms();
  const algorithm = algorithms.find((entry) => entry.slug === slug);

  if (!algorithm) {
    throw new Error(`Unknown algorithm slug: ${slug}`);
  }

  const automatedSupport = await hasThreeLanguageSupport(slug);
  const benchmarkDecision = inferBenchmarkDecision(algorithm, automatedSupport);

  if (benchmarkDecision.mode !== "automated") {
    throw new Error(`Algorithm ${slug} is not benchmarkable in matrix mode (${benchmarkDecision.reason}).`);
  }

  const algorithmHash = await createAlgorithmHash(slug);
  const environment = buildEnvironmentSnapshot({ toolchain, tryRunCommand });
  const harness = buildHarnessSnapshot();
  const lastRunAt = new Date().toISOString();
  const datasets = createDatasets();
  const tempDir = await mkdtemp(path.join(os.tmpdir(), `sort-playground-${slug}-${language}-`));

  logBenchmark(`matrix target: ${slug}/${language}`);

  try {
    const datasetPaths = await writeDatasets(tempDir, datasets);
    const runner = await createRunner(tempDir, slug, language);
    const profileResults = {};

    for (const profile of benchmarkProfiles) {
      profileResults[profile] = {};

      for (const size of benchmarkSizes) {
        const datasetPath = datasetPaths[profile][size];
        const label = `${slug} ${profile}/${size}/${language}`;

        logBenchmark(`${slug}/${language}: validating ${profile}/${size}`);
        const validatedRun = await runner.runWithResult(datasetPath);
        assertSorted(validatedRun.result, `${slug}/${profile}/${size}/${language}`);

        const benchmarked = await benchmarkIterations({
          runner,
          datasetPath,
          label,
        });

        profileResults[profile][size] = benchmarked.averageMs;
      }
    }

    const payload = {
      slug,
      name: algorithm.name,
      language,
      unit: "ms",
      profileResults,
      metadata: {
        source: "github-actions",
        benchmarkMode: "automated",
        algorithmHash,
        lastRunAt,
        lastRunMode: "small",
      },
      environment,
      harness,
    };

    await writeFile(path.join(root, outputPath), `${JSON.stringify(payload, null, 2)}\n`);
    logBenchmark(`wrote partial benchmark result to ${outputPath}`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
    logBenchmark(`cleaned up temporary workspace for ${slug}/${language}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
