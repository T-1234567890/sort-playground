# Benchmark

Benchmark is the Labs area for algorithms that can be compared under controlled conditions.

## What It Is

This page is a measured list of algorithms that can be run fairly on the same datasets and with the same rules.

Benchmark data comes from `/public/data/benchmark-ranking.json`.
That file is generated only in GitHub Actions and then published back through CI.

## Requirements

| Requirement | Rule |
| --- | --- |
| Required identity field | `Algorithm:` slug must stay consistent |
| Benchmark mode | `automated` / `estimated` |
| No benchmark special case | `special: no benchmark` |
| Required files for implemented entries | `meta.json`, `steps.ts`, `python.py`, `rust.rs`, `c.c` |
| PR benchmark section | required |

## Mode A - Automated Benchmark

Used for:

- deterministic algorithms
- algorithms with repeatable runtime behavior
- algorithms that produce meaningful timing comparisons

Rules:

- fixed dataset
- standard dataset profile: small `100`, medium `1000`, large `10000`
- run a few warm-up iterations before measurement
- run multiple measured iterations per dataset
- adapt the measured run count to stay lightweight for slower algorithms
- compute per-size average
- benchmark Python, Rust, and C implementations separately
- runs in GitHub Actions
- is not generated during local dev or local build
- existing algorithms already on the website are scanned from `src/algorithms/**`
- all deterministic algorithms without an explicit exclusion are included automatically

## Mode B - Estimated Benchmark

Used for classic algorithms and well-known theoretical complexity.

Examples:

- Merge Sort
- Quick Sort
- Heap Sort

Rules:

- does not run GitHub Actions
- uses predefined complexity-based estimation
- assigns a relative performance ranking

Example:

```json
{
  "name": "Merge Sort",
  "mode": "estimated",
  "complexity": "O(n log n)",
  "relativeRank": "high"
}
```

## No Benchmark

Allowed when:

- meme sorts with intentionally absurd runtime
- random sorts
- manual sorts
- algorithms whose main value is visual or conceptual rather than measurable performance
- unusual sorting methods that do not produce a fair benchmark comparison

Use:

```text
special: no benchmark
```

## Pull Request Format

```md
## Benchmark

- [ ] Benchmark required
- [ ] special: no benchmark
- [ ] Use estimated benchmark (classic)
```

Only one path should be chosen for an algorithm submission.

## Output Shape

- `name`
- `slug`
- `mode` (`automated` / `estimated` / `none`)
- `results.python`, `results.rust`, `results.c` with `small`, `medium`, `large` or `complexity`
- `metadata`
- optional future placeholders inside `snapshot`
  `workloadProfiles`
  `environment`
  `tiers`
  `harness`
  `score`

## Auto-Scan Behavior

The benchmark generator scans all algorithms already present in `src/algorithms/`.

Default behavior:

- deterministic algorithms with Python, Rust, and C implementations: included automatically
- explicit `benchmarkMode: "estimated"`: fallback only when automated three-language benchmark is unavailable
- explicit `special: "no-benchmark"`: excluded
- random, impossible, or manual methods: excluded automatically

## No-Data Rule

If benchmark data is not ready, the page should not show made-up results.
It should say:

- `Benchmark data will be available after CI runs`
- `No benchmark results yet. Run will be generated after next commit.`
