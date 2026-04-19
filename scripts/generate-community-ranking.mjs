import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const repository = process.env.GITHUB_REPOSITORY || "T-1234567890/sort-playground";
const token = process.env.GITHUB_TOKEN;
const [owner, repo] = repository.split("/");
const eventsPath = path.join(root, "src/data/events.json");
const outputDir = path.join(root, "public/data");
const outputPath = path.join(outputDir, "community-ranking.json");

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseBody(body = "") {
  const fields = {};

  for (const label of ["Name", "Algorithm", "URL", "Why it's interesting", "Category", "Event", "Visualization notes"]) {
    const pattern = new RegExp(`^${label}:\\s*([\\s\\S]*?)(?=^\\w[^\\n]*:|\\Z)`, "im");
    const match = body.match(pattern);
    if (match) {
      fields[label] = match[1].trim().replace(/\n+/g, " ");
    }
  }

  return fields;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchDiscussionEntries() {
  if (!token) {
    return [];
  }

  const query = `
    query RankingDiscussions($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        discussions(first: 100, orderBy: { field: CREATED_AT, direction: DESC }) {
          nodes {
            title
            body
            url
            author {
              login
            }
            reactions(content: THUMBS_UP) {
              totalCount
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "sort-playground-community-ranking",
    },
    body: JSON.stringify({
      query,
      variables: { owner, repo },
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const discussions = payload.data?.repository?.discussions?.nodes ?? [];

  return discussions
    .filter((discussion) => discussion.title?.toLowerCase().startsWith("[ranking]"))
    .map((discussion) => {
      const fields = parseBody(discussion.body);
      const algorithm = fields.Algorithm || discussion.title.replace(/^\[ranking\]\s*/i, "").trim();
      const score = discussion.reactions?.totalCount ?? 0;

      return {
        name: fields.Name || algorithm,
        slug: slugify(algorithm),
        score,
        url: fields.URL || discussion.url,
        author: discussion.author?.login || "unknown",
        category: fields.Category || "Community Favorite",
        event: fields.Event || undefined,
        why: fields["Why it's interesting"] || undefined,
        source: "discussion",
      };
    });
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
    items.push(...await fetchDiscussionEntries());
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

  for (const event of events) {
    const seasonEntries = finalEntries.filter((item) => item.event === event.name || item.event === event.id);
    await writeFile(
      path.join(outputDir, `event-ranking-${event.id}.json`),
      `${JSON.stringify(seasonEntries, null, 2)}\n`,
    );
  }

  console.log(`Wrote ${finalEntries.length} community ranking entries.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
