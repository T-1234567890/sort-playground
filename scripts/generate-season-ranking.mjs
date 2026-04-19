import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const eventsPath = path.join(root, "src/data/events.json");
const communityPath = path.join(root, "public/data/community-ranking.json");
const outputDir = path.join(root, "public/data");

async function main() {
  const events = JSON.parse(await readFile(eventsPath, "utf8"));
  const communityEntries = JSON.parse(await readFile(communityPath, "utf8"));

  await mkdir(outputDir, { recursive: true });

  for (const event of events) {
    const seasonEntries = communityEntries
      .filter((entry) => entry.event === event.name || entry.event === event.id)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

    await writeFile(
      path.join(outputDir, `event-ranking-${event.id}.json`),
      `${JSON.stringify(seasonEntries, null, 2)}\n`,
    );
  }

  console.log(`Generated ${events.length} event ranking file(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
