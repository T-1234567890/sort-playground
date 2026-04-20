import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { algorithmsDir } from "./catalog.js";

export const experimentalLanguageConfig = {
  js: {
    key: "javascript",
    label: "JavaScript",
    runtime: "node",
    source: "community",
    benchmarkSupported: true,
    supportsLargeDatasetBenchmark: false,
  },
  ts: {
    key: "typescript",
    label: "TypeScript",
    runtime: "typescript",
    source: "community",
    benchmarkSupported: true,
    supportsLargeDatasetBenchmark: false,
  },
  go: {
    key: "go",
    label: "Go",
    runtime: "go",
    source: "community",
    benchmarkSupported: true,
    supportsLargeDatasetBenchmark: true,
  },
  java: {
    key: "java",
    label: "Java",
    runtime: "java",
    source: "community",
    benchmarkSupported: true,
    supportsLargeDatasetBenchmark: true,
  },
  cpp: {
    key: "cpp",
    label: "C++",
    runtime: "cpp",
    source: "community",
    benchmarkSupported: true,
    supportsLargeDatasetBenchmark: true,
  },
  swift: {
    key: "swift",
    label: "Swift",
    runtime: "swift",
    source: "community",
    benchmarkSupported: true,
    supportsLargeDatasetBenchmark: true,
  },
  kt: {
    key: "kotlin",
    label: "Kotlin",
    runtime: "kotlin",
    source: "community",
    benchmarkSupported: true,
    supportsLargeDatasetBenchmark: false,
  },
  zig: {
    key: "zig",
    label: "Zig",
    runtime: "zig",
    source: "community",
    benchmarkSupported: true,
    supportsLargeDatasetBenchmark: true,
  },
  rb: {
    key: "ruby",
    label: "Ruby",
    runtime: "ruby",
    source: "community",
    benchmarkSupported: true,
    supportsLargeDatasetBenchmark: false,
  },
};

export function experimentalBenchmarkSizesForLanguageCode(languageCode) {
  return experimentalLanguageConfig[languageCode]?.supportsLargeDatasetBenchmark ? ["small", "medium", "large"] : ["small", "medium"];
}

export function listSupportedCommunityLanguages() {
  return Object.entries(experimentalLanguageConfig)
    .map(([languageCode, config]) => ({
      languageCode,
      languageKey: config.key,
      label: config.label,
      runtime: config.runtime,
      source: config.source,
      benchmarkSupported: config.benchmarkSupported,
      supportsLargeDatasetBenchmark: config.supportsLargeDatasetBenchmark,
      note: config.note,
    }))
    .sort((left, right) => left.languageKey.localeCompare(right.languageKey));
}

export async function listCommunityLanguageTargets() {
  const entries = await readdir(algorithmsDir, { withFileTypes: true });
  const targets = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const slug = entry.name;
    const files = await readdir(path.join(algorithmsDir, slug));

    for (const file of files) {
      const [stem = "", extension = ""] = file.split(".");

      if (!stem || stem !== extension) {
        continue;
      }

      const config = experimentalLanguageConfig[stem];

      if (!config) {
        continue;
      }

      targets.push({
        slug,
        file,
        languageCode: stem,
        languageKey: config.key,
        label: config.label,
        runtime: config.runtime,
        source: config.source,
        benchmarkSupported: config.benchmarkSupported,
        supportsLargeDatasetBenchmark: config.supportsLargeDatasetBenchmark,
        note: config.note,
      });
    }
  }

  return targets.sort((left, right) => left.slug.localeCompare(right.slug) || left.languageKey.localeCompare(right.languageKey));
}

export async function createCommunityLanguageHash(slug, file) {
  const hash = createHash("sha256");
  const filePath = path.join(algorithmsDir, slug, file);
  const content = await readFile(filePath, "utf8");
  hash.update(`FILE:${file}\n`);
  hash.update(content);
  hash.update("\n");
  return hash.digest("hex");
}
