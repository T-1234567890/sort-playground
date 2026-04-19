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
  },
  ts: {
    key: "typescript",
    label: "TypeScript",
    runtime: "typescript",
    source: "community",
    benchmarkSupported: true,
  },
  go: {
    key: "go",
    label: "Go",
    runtime: "go",
    source: "community",
    benchmarkSupported: true,
  },
  java: {
    key: "java",
    label: "Java",
    runtime: "java",
    source: "community",
    benchmarkSupported: false,
    note: "Recognized community language, but benchmark runner support is not implemented yet.",
  },
  cpp: {
    key: "cpp",
    label: "C++",
    runtime: "cpp",
    source: "community",
    benchmarkSupported: false,
    note: "Recognized community language, but benchmark runner support is not implemented yet.",
  },
  swift: {
    key: "swift",
    label: "Swift",
    runtime: "swift",
    source: "community",
    benchmarkSupported: false,
    note: "Recognized community language, but benchmark runner support is not implemented yet.",
  },
  kt: {
    key: "kotlin",
    label: "Kotlin",
    runtime: "kotlin",
    source: "community",
    benchmarkSupported: false,
    note: "Recognized community language, but benchmark runner support is not implemented yet.",
  },
  zig: {
    key: "zig",
    label: "Zig",
    runtime: "zig",
    source: "community",
    benchmarkSupported: false,
    note: "Recognized community language, but benchmark runner support is not implemented yet.",
  },
  rb: {
    key: "ruby",
    label: "Ruby",
    runtime: "ruby",
    source: "community",
    benchmarkSupported: false,
    note: "Recognized community language, but benchmark runner support is not implemented yet.",
  },
};

export function listSupportedCommunityLanguages() {
  return Object.entries(experimentalLanguageConfig)
    .map(([languageCode, config]) => ({
      languageCode,
      languageKey: config.key,
      label: config.label,
      runtime: config.runtime,
      source: config.source,
      benchmarkSupported: config.benchmarkSupported,
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
