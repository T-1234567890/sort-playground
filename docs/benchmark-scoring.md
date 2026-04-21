# Benchmark Scoring

This file documents how Sort Playground calculates and displays benchmark scores.

Source of truth:

- `scripts/benchmark/scoring.js`
- `scripts/benchmark/recalculate-scores.js`
- `src/core/benchmark.ts`
- `src/hooks/useSettings.tsx`

## 1. Two Layers

The benchmark system now has two score layers:

- stored score values in `public/data/benchmark-ranking.json`
- displayed score values in the UI

### Stored score values

The benchmark workflow stores linear score fields inside `snapshot.score`.

These are the values produced by:

- `scripts/benchmark/scoring.js`

### Displayed score values

The app can display stored scores in two modes through app settings:

- `processed`
- `raw`

These are handled in:

- `src/core/benchmark.ts`
- `src/hooks/useSettings.tsx`

## 2. Raw Timing vs Score

The benchmark still exposes two value families:

- `results`
- `snapshot.score`

### `results`

`results` stores raw benchmark timing in milliseconds.

These are measured execution times.

### `snapshot.score`

`snapshot.score` stores derived score fields:

- `sizeScores`
- `dimensionScores`
- `normalized`
- `composite`
- `percentile`
- `badges`

The JSON schema does not change.

## 3. Fixed Reference Model

The benchmark uses fixed reference timings instead of comparing against the current fastest algorithm.

Current references:

```text
small  = 0.1 ms
medium = 1.0 ms
large  = 5.0 ms
```

These values are defined in:

- `scripts/benchmark/dataset.js`

## 4. Stored Scoring Formula

Stored score fields use a linear formula:

```text
stored_score = (reference / measured_time) * 100
```

This means:

- `100` matches the reference
- higher than `100` is faster than the reference
- lower than `100` is slower than the reference

Key properties:

- stored scores are not capped
- stored scores do not depend on other algorithms
- very fast implementations can produce large values
- missing measurements do not produce fake `0` scores

## 5. Display Modes

The app supports two display modes through `/settings`.

### Processed score

`processed` is the default UI mode.

Formula:

```text
processed_display = stored_score
```

This is the familiar `×100` display scale.

Example:

```text
stored_score = 145.0
processed_display = 145.0
```

### Raw score

`raw` shows the underlying ratio before the `×100` display scaling.

Formula:

```text
raw_display = stored_score / 100
```

Example:

```text
stored_score = 145.0
raw_display = 1.45
```

Interpretation:

- `1.0` matches the reference
- greater than `1.0` is faster than the reference
- less than `1.0` is slower than the reference

## 6. Size Scores

`sizeScores[language][size]` are calculated from top-level `results`.

Stored formula:

```text
sizeScore = (reference[size] / results[language][size]) * 100
```

## 7. Dimension Scores

`dimensionScores[language][profile]` are calculated from workload-profile timings.

For each language/profile pair:

1. average the available timings across included sizes
2. average the matching fixed references for those included sizes
3. apply the same stored linear formula

Stored formula:

```text
profileAverage = average(profile timings across included sizes)
referenceAverage = average(fixed references across included sizes)
dimensionScore = (referenceAverage / profileAverage) * 100
```

## 8. Normalized Score

`normalized` remains an average of all numeric `sizeScores`.

Formula:

```text
normalized = average(all numeric sizeScores)
```

## 9. Composite Score

`composite` remains an average of all numeric `dimensionScores`.

Formula:

```text
composite = average(all numeric dimensionScores)
```

This is the main stored score used for ranking.

## 10. Percentile

`percentile` is still relative ranking.

Process:

1. compute `composite`
2. sort automated entries by descending `composite`
3. assign percentile from that ordering

Important distinction:

- `composite` is stable unless that entry’s timings change
- `percentile` can still move when other entries are added or change

## 11. Missing Data and Safety

The scoring system skips invalid values instead of generating artificial outputs.

Rules:

- if `value <= 0`, skip score generation
- if `value` is not finite, skip score generation
- no `NaN`
- no `Infinity`
- no artificial `0`

Automated entries may use:

- `benchmarked`
- `partial`
- `skipped`

## 12. Raw Average

`rawAverageMs` remains descriptive timing metadata.

It is the average of all numeric workload timings across:

- workload profiles
- languages
- sizes

## 13. Badges

Badges are heuristic labels layered on top of stored score fields.

Examples:

- `Fast Random`
- `Handles Duplicates Well`
- `Adversarial Ready`
- `Cross-Language Balanced`
- `Top Overall`

## 14. Practical Reading Guide

Short version:

- timings are raw milliseconds
- stored scores are linear fixed-reference scores
- processed display shows the stored `×100` scale
- raw display shows the underlying ratio
- higher score still means faster relative performance
- scores are not capped

## 15. Post-Processing Workflow

There is a dedicated score recalculation step in the benchmark workflow.

Purpose:

- recompute score-family fields from existing timing data
- update old entries without rerunning raw benchmarks
- keep stored score fields aligned with the current formula

The recalculation step uses:

- `scripts/benchmark/recalculate-scores.js`
