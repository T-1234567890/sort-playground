import { readFile } from "node:fs/promises";
import path from "node:path";
import { root } from "./catalog.js";
import { writeRanking } from "./output.js";
import { computeScoreSnapshots, sortRanking } from "./scoring.js";

const inputPath = path.resolve(root, process.env.BENCHMARK_INPUT_PATH || "public/data/benchmark-ranking.json");

async function main() {
  const ranking = JSON.parse(await readFile(inputPath, "utf8"));

  computeScoreSnapshots(ranking);
  sortRanking(ranking);
  await writeRanking(root, ranking);

  console.log(`[benchmark] recalculated score snapshots for ${ranking.length} benchmark entries from ${path.relative(root, inputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
