import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { benchmarkIterations } from "./benchmark.js";
import { benchmarkProfiles, benchmarkSizes, createDatasets, writeDatasets } from "./dataset.js";
import { buildEnvironmentSnapshot, buildHarnessSnapshot } from "./output.js";
import { createJavaScriptRunner } from "./runner-js.js";
import { createTypeScriptRunner } from "./runner-ts.js";
import { createGoRunner } from "./runner-go.js";
import { assertSorted } from "./validator.js";
import { algorithmsDir, hasTool, loadAlgorithms, root, tryRunCommand } from "./catalog.js";
import { createCommunityLanguageHash, experimentalLanguageConfig } from "./community-languages.js";

const slug = process.env.ALGORITHM;
const languageCode = process.env.LANGUAGE_CODE;
const outputPath = process.env.OUTPUT_PATH || `community-language-${slug}-${languageCode}.json`;

const toolchain = {
  node: "node",
  go: "go",
};

function logBenchmark(message) {
  console.log(`[benchmark:languages] ${message}`);
}

function assertGitHubActions() {
  if (process.env.GITHUB_ACTIONS !== "true") {
    throw new Error("Experimental benchmark data is CI-only. Run this script from GitHub Actions.");
  }
}

async function createRunner(tempDir, selectedSlug, selectedLanguageCode) {
  if (selectedLanguageCode === "js") {
    return createJavaScriptRunner({ root, tempDir, algorithmsDir, slug: selectedSlug, nodeCommand: toolchain.node });
  }

  if (selectedLanguageCode === "ts") {
    return createTypeScriptRunner({ root, tempDir, algorithmsDir, slug: selectedSlug, nodeCommand: toolchain.node });
  }

  if (selectedLanguageCode === "go") {
    return createGoRunner({ root, tempDir, algorithmsDir, slug: selectedSlug, goCommand: toolchain.go });
  }

  throw new Error(`Unsupported experimental language: ${selectedLanguageCode}`);
}

async function main() {
  assertGitHubActions();

  if (!slug || !languageCode) {
    throw new Error("ALGORITHM and LANGUAGE_CODE environment variables are required.");
  }

  if (!hasTool(toolchain.node)) {
    throw new Error(`Missing required node toolchain: ${toolchain.node}`);
  }

  if (languageCode === "go" && !hasTool(toolchain.go)) {
    throw new Error(`Missing required go toolchain: ${toolchain.go}`);
  }

  const config = experimentalLanguageConfig[languageCode];

  if (!config) {
    throw new Error(`Unsupported experimental language code: ${languageCode}`);
  }

  const algorithms = await loadAlgorithms();
  const algorithm = algorithms.find((entry) => entry.slug === slug);

  if (!algorithm) {
    throw new Error(`Unknown algorithm slug: ${slug}`);
  }

  const languageHash = await createCommunityLanguageHash(slug, `${languageCode}.${languageCode}`);
  const environment = buildEnvironmentSnapshot({
    toolchain: {
      python: toolchain.node,
      rust: languageCode === "go" ? toolchain.go : toolchain.node,
      c: toolchain.node,
    },
    tryRunCommand,
  });
  const harness = buildHarnessSnapshot();
  const lastRunAt = new Date().toISOString();
  const datasets = createDatasets();
  const tempDir = await mkdtemp(path.join(os.tmpdir(), `sort-playground-language-${slug}-${languageCode}-`));

  logBenchmark(`matrix target: ${slug}/${languageCode}`);

  try {
    const datasetPaths = await writeDatasets(tempDir, datasets);
    const runner = await createRunner(tempDir, slug, languageCode);
    const profileResults = {};

    for (const profile of benchmarkProfiles) {
      profileResults[profile] = {};

      for (const size of benchmarkSizes) {
        const datasetPath = datasetPaths[profile][size];
        const label = `${slug} ${profile}/${size}/${languageCode}`;

        logBenchmark(`${slug}/${languageCode}: validating ${profile}/${size}`);
        const validatedRun = await runner.runWithResult(datasetPath);
        assertSorted(validatedRun.result, `${slug}/${profile}/${size}/${languageCode}`);

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
      languageCode,
      languageKey: config.key,
      label: config.label,
      source: config.source,
      runtime: config.runtime,
      file: `${languageCode}.${languageCode}`,
      unit: "ms",
      profileResults,
      metadata: {
        languageHash,
        lastRunAt,
        benchmarkMode: "community-language",
      },
      environment,
      harness,
    };

    await writeFile(path.join(root, outputPath), `${JSON.stringify(payload, null, 2)}\n`);
    logBenchmark(`wrote partial language benchmark result to ${outputPath}`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
    logBenchmark(`cleaned up temporary workspace for ${slug}/${languageCode}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
