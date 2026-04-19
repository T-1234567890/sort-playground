import path from "node:path";
import process from "node:process";

export const root = process.cwd();
export const repository = process.env.GITHUB_REPOSITORY || "T-1234567890/sort-playground";
export const token = process.env.GITHUB_TOKEN;
export const [owner, repo] = repository.split("/");
export const eventsPath = path.join(root, "src/data/events.json");
export const outputDir = path.join(root, "public/data");

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseBody(body = "") {
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

export async function fetchGraphql(query, variables) {
  if (!token) {
    return undefined;
  }

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "sort-playground-labs",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchRankingDiscussions() {
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

  const payload = await fetchGraphql(query, { owner, repo });
  return payload?.data?.repository?.discussions?.nodes ?? [];
}

export async function fetchEventSources() {
  const query = `
    query EventSources($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        discussions(first: 100, orderBy: { field: UPDATED_AT, direction: DESC }) {
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
        pullRequests(first: 100, orderBy: { field: UPDATED_AT, direction: DESC }, states: [OPEN, MERGED, CLOSED]) {
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

  const payload = await fetchGraphql(query, { owner, repo });
  return {
    discussions: payload?.data?.repository?.discussions?.nodes ?? [],
    pullRequests: payload?.data?.repository?.pullRequests?.nodes ?? [],
  };
}

export function normalizeRankingDiscussion(discussion) {
  const fields = parseBody(discussion.body);
  const algorithm = fields.Algorithm || discussion.title.replace(/^\[ranking\]\s*/i, "").trim();

  return {
    name: fields.Name || algorithm,
    slug: slugify(algorithm),
    score: discussion.reactions?.totalCount ?? 0,
    url: fields.URL || discussion.url,
    author: discussion.author?.login || "unknown",
    category: fields.Category || "Community Favorite",
    event: fields.Event || undefined,
    why: fields["Why it's interesting"] || undefined,
    source: "discussion",
  };
}

export function normalizeEventItem(item, source) {
  const fields = parseBody(item.body);
  const event = fields.Event || "";
  const algorithm = fields.Algorithm || item.title.replace(/^\[ranking\]\s*/i, "").trim();

  return {
    name: fields.Name || algorithm,
    slug: slugify(algorithm),
    score: item.reactions?.totalCount ?? 0,
    url: fields.URL || item.url,
    author: item.author?.login || "unknown",
    category: fields.Category || "Community Favorite",
    event,
    why: fields["Why it's interesting"] || undefined,
    source,
  };
}
