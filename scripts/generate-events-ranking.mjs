import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  eventsPath,
  fetchEventSources,
  normalizeEventItem,
  outputDir,
  root,
} from "./labs/discussions-shared.mjs";

const outputPath = path.join(outputDir, "event-ranking.json");

function matchesActiveEvent(item, events) {
  const eventValue = String(item.event || "").trim();

  if (!eventValue) {
    return false;
  }

  return events.some((event) => event.status === "active" && (eventValue === event.id || eventValue === event.name));
}

async function main() {
  const events = JSON.parse(await readFile(eventsPath, "utf8"));
  const items = [];
  let existingEntries = [];

  try {
    existingEntries = JSON.parse(await readFile(outputPath, "utf8"));
  } catch {
    existingEntries = [];
  }

  try {
    const { discussions, pullRequests } = await fetchEventSources();
    items.push(
      ...discussions
        .map((item) => normalizeEventItem(item, "discussion"))
        .filter((item) => matchesActiveEvent(item, events)),
      ...pullRequests
        .map((item) => normalizeEventItem(item, "pull-request"))
        .filter((item) => matchesActiveEvent(item, events)),
    );
  } catch (error) {
    console.warn("Unable to fetch event sources:", error.message);
  }

  const deduped = Array.from(
    new Map(
      items.map((item) => [
        `${item.slug}:${item.source}:${item.category}:${item.event}`,
        item,
      ]),
    ).values(),
  ).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const finalEntries = deduped.length > 0 ? deduped : existingEntries;

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(finalEntries, null, 2)}\n`);
  console.log(`Wrote ${finalEntries.length} event ranking entries to ${path.relative(root, outputPath)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
