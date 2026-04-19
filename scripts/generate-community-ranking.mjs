import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  fetchRankingDiscussions,
  normalizeRankingDiscussion,
  outputDir,
  root,
} from "./labs/discussions-shared.mjs";

const outputPath = path.join(outputDir, "community-ranking.json");

async function main() {
  const items = [];
  let existingEntries = [];

  try {
    existingEntries = JSON.parse(await readFile(outputPath, "utf8"));
  } catch {
    existingEntries = [];
  }

  try {
    const discussions = await fetchRankingDiscussions();
    items.push(
      ...discussions
        .filter((discussion) => discussion.title?.toLowerCase().startsWith("[ranking]"))
        .map(normalizeRankingDiscussion),
    );
  } catch (error) {
    console.warn("Unable to fetch ranking discussions:", error.message);
  }

  const deduped = Array.from(
    new Map(
      items.map((item) => [
        `${item.slug}:${item.source}:${item.category}`,
        item,
      ]),
    ).values(),
  ).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const finalEntries = deduped.length > 0 ? deduped : existingEntries;

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(finalEntries, null, 2)}\n`);
  console.log(`Wrote ${finalEntries.length} community ranking entries to ${path.relative(root, outputPath)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
