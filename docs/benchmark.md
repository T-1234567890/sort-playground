# Benchmark

Sort Playground Benchmark is a CI-generated benchmark dataset for deterministic sorting algorithms.

This document exists for public trust, not just contributor convenience.
It defines what the benchmark measures, what it excludes, how results are produced, and what guarantees the project is willing to make.

## Public Trust Statement

The benchmark is intended to be:

- reproducible
- transparent
- modest in its claims
- useful for comparison, not marketing

The project does **not** claim that these results are universal hardware truth or a scientific performance paper.
It claims something narrower and more defensible:

- the same benchmark harness is used across supported algorithms
- the same datasets are reused across languages
- correctness is validated before timings are accepted
- published data comes from GitHub Actions, not from ad hoc local generation

## Source Of Truth

Published benchmark data is stored at:

`/public/data/benchmark-ranking.json`

This file is generated only by CI through:

- [.github/workflows/benchmark.yml](/Users/2111832868qq.com/PycharmProjects/sort-playground/.github/workflows/benchmark.yml:1)
- [.github/workflows/benchmark-direct-push.yml](/Users/2111832868qq.com/PycharmProjects/sort-playground/.github/workflows/benchmark-direct-push.yml:1)

The benchmark runtime entry point is:

- [scripts/benchmark/run.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/run.js:1)

The older [scripts/generate-benchmark-ranking.mjs](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/generate-benchmark-ranking.mjs:1) file is only a wrapper to the modular benchmark runner.

## Runtime Environment

The benchmark runs in GitHub Actions on `ubuntu-latest`.

Current benchmark toolchain:

- Node.js `22`
- Python `3.12`
- Rust `stable`
- system C compiler via `cc`

Why this matters:

- everyone can inspect the workflow
- the environment is versioned in the repository
- benchmark output includes a system snapshot with runtime metadata

## Benchmark Modes

There are two CI benchmark modes.

### Small Run

Default mode for normal algorithm changes.

Rules:

- runs on algorithm-related pushes and PR validation
- benchmarks only new or changed algorithms
- reuses existing benchmark entries when the algorithm hash matches
- keeps previous benchmark data for unchanged algorithms

This reduces unnecessary CI work while preserving stable published data.

### Full Run

Scheduled refresh mode.

Rules:

- runs monthly via workflow schedule
- ignores cache reuse
- reruns all eligible automated benchmark entries
- overwrites the full published benchmark dataset

This prevents the benchmark from drifting forever on stale historical measurements.

## Eligibility Rules

### Automated Benchmark

An algorithm is eligible for automated benchmarking when all of the following are true:

- it is deterministic enough to produce repeatable results
- it is not explicitly excluded
- it has `python.py`, `rust.rs`, and `c.c`
- it passes correctness validation in all three languages

### Estimated Benchmark

An algorithm may use estimated mode when theoretical ranking is still useful but automated three-language measurement is not available.

Estimated entries are clearly labeled as estimated and are not mixed up with automated timings.

### Excluded / No Benchmark

An algorithm is excluded when benchmarking would be misleading or not meaningful.

Common exclusions:

- random or shuffle-based sorts
- manual or user-dependent sorts
- absurd or pathological joke sorts
- explicitly marked `benchmark: false`
- explicitly marked `special: "no-benchmark"`

## Dataset Policy

The benchmark uses fixed deterministic datasets.

Standard size profile:

- `small = 100`
- `medium = 1000`
- `large = 10000`

Workload profiles currently benchmarked:

- random uniform
- nearly sorted
- reverse sorted
- many duplicates
- low value range
- adversarial pivot-sensitive input

The dataset generator lives in:

- [scripts/benchmark/dataset.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/dataset.js:1)

Important guarantees:

- datasets are deterministic
- the same dataset files are reused across all languages
- the same workload profile is measured for Python, Rust, and C

## Validation Policy

Benchmark results are never accepted on timing alone.

Validation rules:

- each language must return a sorted result
- all three languages must return the same sorted output for the same input
- a mismatch causes the benchmark run to fail

Validation logic lives in:

- [scripts/benchmark/validator.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/validator.js:1)

This is a hard trust requirement.
If implementations disagree, the benchmark should fail rather than publish a misleading timing.

## Timing Policy

Timing logic lives in:

- [scripts/benchmark/benchmark.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/benchmark.js:1)

Current policy:

- `5` warm-up runs
- `30` measured runs
- average time reported in milliseconds

Why repeated runs are used:

- to reduce one-off runtime noise
- to avoid overreacting to startup overhead
- to make the published number more stable for display

## Language Runner Model

Each language has a dedicated runner:

- [runner-python.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/runner-python.js:1)
- [runner-rust.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/runner-rust.js:1)
- [runner-c.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/runner-c.js:1)

Each runner is responsible for:

- loading the algorithm implementation
- executing it against benchmark datasets
- returning timing data
- returning full sorted output for validation mode
- failing when output is invalid

## Scoring Model

Raw timings are preserved, but the benchmark also computes score snapshots for easier interpretation.

Scoring logic lives in:

- [scripts/benchmark/scoring.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/scoring.js:1)

Stored score fields include:

- per-dimension normalized scores
- per-size normalized scores
- composite score
- percentile
- badges
- raw average milliseconds

Important note:

- composite score is a convenience layer for comparison
- raw timings remain the primary factual measurement
- scores are derived from benchmark data, not hand-assigned

## Published Metadata

Each automated benchmark entry may include:

- `results` for Python, Rust, and C across `small`, `medium`, `large`
- `metadata.algorithmHash`
- `metadata.lastRunAt`
- `metadata.lastRunMode`
- `snapshot.environment`
- `snapshot.harness`
- `snapshot.workloadProfiles`
- `snapshot.score`

This metadata is important for public trust because it makes each result inspectable instead of opaque.

## Workflow Policy

### PR Validation

PR validation generates a benchmark artifact but does not publish to the main branch.

Purpose:

- catch correctness problems
- catch cross-language mismatches
- ensure the benchmark runner still works

### Direct Push / Scheduled Publish

Main-branch benchmark runs can publish the generated JSON back into the repository.

Purpose:

- keep the deployed benchmark dataset current
- make published results auditable through Git history

## What The Benchmark Does Not Claim

To keep the system publicly trustworthy, these claims are **not** made:

- it does not claim to represent all hardware
- it does not claim browser performance
- it does not claim every implementation is equally optimized by humans
- it does not claim absolute scientific rigor
- it does not claim fair comparison for excluded pathological or non-deterministic sorts

This benchmark is a controlled comparative benchmark for this project’s supported implementations.

## Failure Policy

The benchmark should fail rather than silently publish questionable data when:

- a required toolchain is missing
- an automated algorithm fails to sort correctly
- different language implementations disagree on output
- the CI-only runner is executed outside GitHub Actions

Publishing no benchmark is better than publishing a wrong benchmark.

## Contributor Guidance

If you want an algorithm to participate in automated benchmarking:

- keep the algorithm deterministic
- provide `python.py`, `rust.rs`, and `c.c`
- ensure all three implementations produce identical sorted output
- avoid special cases that depend on user interaction or randomness

If benchmarking is not meaningful, mark the algorithm honestly instead of forcing it into the system.

## Trust Checklist

Before treating a benchmark result as credible, the project expects all of these to be true:

- result was generated by CI
- algorithm is eligible for automated benchmarking
- validation passed
- workload profile data exists
- system snapshot exists
- run metadata exists
- raw results and composite score agree directionally

If one of those is missing, treat the entry as incomplete rather than authoritative.
