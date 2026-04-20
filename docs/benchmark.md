# Benchmark

## 1. Overview

The benchmark system measures sorting algorithms across three implementation languages:

- Python
- Rust
- C

It is designed for reproducible comparative results, not scientific benchmarking.

Core characteristics:

- cross-language comparison for the same algorithm
- deterministic datasets and workload profiles
- incremental benchmarking that reuses existing results
- CI-driven data generation

Published benchmark data is stored in:

- `/public/data/benchmark-ranking.json`

JSON conventions for generated benchmark data are documented in:

- [JSON Files](./json-files.md)

The benchmark pipeline is driven by:

- [/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/list-algorithms.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/list-algorithms.js)
- [/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/run.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/run.js)
- [/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/merge-results.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/merge-results.js)

Scoring details are documented in:

- [Benchmark Scoring](./benchmark-scoring.md)

## 2. Running Benchmark Locally

The benchmark runner is CI-first.

The entry point used by GitHub Actions is:

```bash
node scripts/benchmark/run.js
```

Current constraint:

- `run.js` requires GitHub Actions style environment variables
- it runs one `algorithm + language` target at a time
- it refuses to run unless `GITHUB_ACTIONS=true`

For local development, the useful commands are usually:

```bash
BENCHMARK_RUN_MODE=small node scripts/benchmark/list-algorithms.js
```

and, if you intentionally want to simulate one CI target locally:

```bash
GITHUB_ACTIONS=true ALGORITHM=quick-sort LANGUAGE=python node scripts/benchmark/run.js
```

Relevant environment variables:

- `BENCHMARK_RUN_MODE=small`
- `BENCHMARK_RUN_MODE=full`

Meaning:

- `small` -> benchmark only algorithms that are missing reusable benchmark data
- `full` -> include all benchmarkable algorithms in selection

Important note:

- the current published workflow uses `small`
- `full` exists in the script layer, but normal CI publishing is incremental

## 3. Benchmark Modes

### Small Mode

Properties:

- incremental
- faster
- used by current CI workflows

Behavior:

- loads the existing benchmark JSON
- compares stored benchmark metadata against the current algorithm hash
- only selects algorithms that are missing valid reusable results

### Full Mode

Properties:

- complete selection
- slow
- mainly useful for manual recalculation or local/temporary maintenance work

Behavior:

- ignores reuse during selection
- includes all benchmarkable algorithms

## 4. Dataset and Workloads

Dataset sizes:

- `small = 100`
- `medium = 1000`
- `large = 10000`

Workload profiles:

- `random-uniform`
- `nearly-sorted`
- `reverse-sorted`
- `many-duplicates`
- `low-value-range`
- `adversarial-pivot`

These inputs exist for consistency and comparability.

Why this matters:

- every language runs the same datasets
- every benchmarkable algorithm is measured under the same workload labels
- results are easier to compare across implementations

Dataset generation lives in:

- [/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/dataset.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/dataset.js)

## 5. Adding a New Algorithm

1. Create a folder under `/src/algorithms/<slug>`.
2. Add the required files:
   - `meta.json`
   - `steps.ts`
   - `python.py`
   - `rust.rs`
   - `c.c`
3. Make sure the algorithm is discoverable by the existing loader.
   The project reads directly from `/src/algorithms`, so there is no benchmark YAML list to edit.
4. If the algorithm should not be benchmarked, mark it explicitly in `meta.json`:
   - `benchmark: false`
   - or `special: "no-benchmark"`

Benchmark behavior after adding an algorithm:

- a new benchmarkable algorithm is automatically selected by the CI benchmark pipeline
- an existing algorithm with reusable benchmark data is skipped
- an existing algorithm whose benchmark hash changes is reselected

Benchmarkability requirements:

- deterministic behavior
- working `python.py`, `rust.rs`, and `c.c`
- consistent sorted output across languages

## 6. Benchmark Execution Model

The benchmark system is orchestrated by Node.js.

Execution flow:

1. discover benchmarkable algorithms
2. decide whether existing JSON data can be reused
3. create a matrix of `algorithm x language`
4. run one target per job
5. validate outputs
6. merge partial results into the final ranking JSON

Language execution is separate:

- Python runs through a Python runner
- Rust runs through a Rust runner
- C runs through a C runner

Validation is required before timings are accepted:

- each implementation must return a sorted result
- all languages for the same algorithm must agree on output

Key files:

- [/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/runner-python.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/runner-python.js)
- [/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/runner-rust.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/runner-rust.js)
- [/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/runner-c.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/runner-c.js)
- [/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/validator.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/validator.js)
- [/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/benchmark.js](/Users/2111832868qq.com/PycharmProjects/sort-playground/scripts/benchmark/benchmark.js)

## 7. Result Storage

The final benchmark dataset is stored in:

- `/public/data/benchmark-ranking.json`

What it contains:

- benchmarkable algorithm entries
- cross-language timing data
- workload profile snapshots
- score snapshots
- environment and harness metadata

Storage model:

- benchmark jobs produce partial JSON files per `algorithm/language`
- merge step combines those partials into the final ranking file
- unchanged valid entries are reused from the existing ranking JSON

Reuse is based on:

- stored benchmark completeness
- stored `metadata.algorithmHash`
- current source hash for `meta.json`, `python.py`, `rust.rs`, and `c.c`

## 8. CI Pipeline

The benchmark pipeline runs in GitHub Actions.

Current workflows:

- [/Users/2111832868qq.com/PycharmProjects/sort-playground/.github/workflows/benchmark.yml](/Users/2111832868qq.com/PycharmProjects/sort-playground/.github/workflows/benchmark.yml)
- [/Users/2111832868qq.com/PycharmProjects/sort-playground/.github/workflows/benchmark-direct-push.yml](/Users/2111832868qq.com/PycharmProjects/sort-playground/.github/workflows/benchmark-direct-push.yml)

Pipeline structure:

1. generate algorithm matrix dynamically
2. run benchmark jobs in parallel for each `algorithm/language`
3. merge partial results
4. publish the final JSON artifact

Direct push workflow also commits refreshed benchmark data back to `main` when the generated JSON changes.

Important detail:

- adding an algorithm does not require editing workflow YAML
- the algorithm list is generated from repository contents

## 9. Limitations

This benchmark is intentionally approximate.

Known limitations:

- results are environment-dependent
- Python includes interpreter and process overhead
- GitHub-hosted runners are not perfectly identical
- cross-language jobs may not run on the exact same machine
- this is not a scientific benchmark lab

Use the results for:

- relative comparison inside this project
- regression detection
- educational comparison across implementations

Do not use the results for:

- absolute hardware claims
- language-wide performance claims
- publication-grade benchmarking

## 10. Re-running Benchmarks

Normal CI behavior is incremental.

That means:

- already-tested unchanged algorithms are reused
- missing or changed benchmarkable algorithms are benchmarked

If you need to rerun benchmarks manually:

- use the GitHub Actions workflow dispatch on the benchmark workflow
- or temporarily run selection with `BENCHMARK_RUN_MODE=full` for maintenance work

When manual reruns are useful:

- benchmark schema changed
- workload definitions changed
- score calculation changed
- benchmark JSON is incomplete or invalid

Important note:

- there is no separate always-on full benchmark publishing workflow at the moment
- the default published path is incremental reuse plus fill-in

## 11. Design Philosophy

The benchmark system is built around a few priorities:

- lightweight
- reproducible
- practical over perfect
- maintainable over clever

Design choices follow that philosophy:

- deterministic datasets instead of complex synthetic labs
- reusable JSON state instead of rerunning everything every time
- modular runners instead of a monolithic benchmark script
- CI-generated output instead of ad hoc local publishing

The goal is a benchmark that is understandable, inspectable, and good enough to support product UI and developer iteration without over-engineering the system.
