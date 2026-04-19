# Sort Labs: How It Works

Sort Labs adds experimental views on top of the main algorithm explorer.

## Global Rules

### Algorithm Identity

All algorithms must have a unique `algorithm` slug.

This slug is used across:

- Community Ranking
- Benchmark
- Events
- frontend routing

Example:

```md
Algorithm:
example-sort
```

This value must stay consistent everywhere.

### Category Rules

Category must be one of:

- Most Fun
- Best Visualization
- Most Creative
- Community Favorite

Free-form categories are not allowed.

### Experimental Notice

Sort Labs is experimental and may evolve over time.

## The Three Parts

### Community Ranking

Community ranking is intended to surface algorithms that people find interesting, clever, funny, or visually satisfying.

Signals may eventually come from:

- GitHub discussions
- GitHub reactions (`👍`)
- event participation
- maintainers' review notes

Each discussion collects `👍` reactions.

Score is calculated as:

```text
score = number of 👍 reactions
```

The ranking should read like a list, not a dense dashboard. Until enough signal exists, the UI should show a placeholder instead of fake standings.

### Benchmark

Benchmark is for algorithms that can be measured or classified in a fair and repeatable way.

There are two benchmark modes:

#### Automated Benchmark

Used for deterministic algorithms that have Python, Rust, and C implementations.

Rules:

- fixed dataset profile
  small: 100
  medium: 1000
  large: 10000
- run multiple times in each language
- compute per-size averages for Python, Rust, and C separately
- runs in GitHub Actions
- does not generate benchmark data during local dev or local build

#### Estimated Benchmark

Used only when automated three-language benchmarking is not available and theoretical complexity is still useful.

Examples:

- Merge Sort
- Quick Sort
- Heap Sort

Rules:

- does not run GitHub Actions
- uses complexity-based estimation
- assigns a relative performance rank
- reduces CI cost for well-understood classics

Not every algorithm belongs here. Some sorts are intentionally chaotic, depend on user interaction, or rely on behavior that does not produce stable timing data.

Benchmark data should only appear when:

- the benchmark workflow is ready
- the input set is defined
- the runs are repeatable enough to compare

Until then, the page should show a collection state rather than pretend to have authoritative numbers.

Algorithms may also be marked:

```text
special: no benchmark
```

Use this when:

- the algorithm is non-deterministic
- the algorithm is a meme or joke
- the algorithm is visualization-only
- benchmarking is meaningless

### Events

Events are short themed seasons. They help focus submissions around a prompt such as weird sorts, visual sorts, or community favorites.

An event page should explain:

- the theme
- the time window
- the categories
- how to join

The `Event:` field must match the exact event name to be recognized.

Event ranking should stay hidden until real submissions are collected.

## Data Output Consistency

### Community

- `name`
- `slug`
- `score`
- `category`
- `event`

### Benchmark

- `name`
- `slug`
- `mode` (`automated` / `estimated` / `none`)
- `results.python`, `results.rust`, `results.c` or `complexity`
- `metadata`
- optional `snapshot` placeholders for future benchmark spec work

### Events

- `event id`
- `entries`

## Why Labs Uses Placeholders

Showing fabricated rankings is worse than showing no rankings.

If the project does not yet have enough real submissions or benchmark data, the Labs pages should say that clearly and keep the space ready for future collection.

## Documentation and GitHub

Labs should always point contributors to:

- local project docs in `docs/`
- `CONTRIBUTING.md`
- GitHub Discussions
- issue templates for bugs, features, and new algorithms

That keeps the contribution path explicit instead of forcing people to guess where to start.
