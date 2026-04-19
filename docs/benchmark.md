# Benchmark

Benchmark is the Labs area for algorithms that can be compared under controlled conditions.

## What It Is

This page is meant to become a measured list of algorithms that can be run fairly on the same datasets and with the same rules.

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
- run multiple times
- compute average
- runs in GitHub Actions
- existing algorithms already on the website are scanned from `src/algorithms/**`
- classic algorithms without an explicit exclusion are included automatically

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
- `average` or `complexity`
- `metadata`

## Auto-Scan Behavior

The benchmark generator scans all algorithms already present in `src/algorithms/`.

Default behavior:

- classic algorithms: included automatically
- explicit `benchmarkMode: "estimated"`: included as estimated
- explicit `special: "no-benchmark"`: excluded
- weird, meme, randomized, manual, custom-visualization, or otherwise unusual methods: excluded automatically

## No-Data Rule

If benchmark data is not ready, the page should not show made-up results. It should show a clear placeholder that says data is still being collected.
