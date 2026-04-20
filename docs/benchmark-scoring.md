# Benchmark Scoring

This file documents how Sort Playground currently calculates benchmark score fields.

Source of truth:

- `scripts/benchmark/scoring.js`

## 1. Important Distinction

There are two different benchmark value families:

- `results`
- `snapshot.score`

They are not calculated the same way.

### `results`

The top-level `results` field is the benchmark timing used for the main per-language, per-size display.

It comes from the `random-uniform` workload profile only.

That mapping is created in:

- `scripts/benchmark/merge-results.js`

Example shape:

```json
{
  "results": {
    "python": { "small": 0.075, "medium": 0.986, "large": 16.59 },
    "rust": { "small": 0.004, "medium": 0.053, "large": 0.581 },
    "c": { "small": 0.003, "medium": 0.047, "large": 0.457 }
  }
}
```

So:

- visible benchmark result numbers are based on `random-uniform`
- size-based score fields are also derived from those `results`

### `snapshot.score`

The score snapshot is broader.

It uses all benchmark workload profiles, not just `random-uniform`.

Current workload profiles:

- `random-uniform`
- `nearly-sorted`
- `reverse-sorted`
- `many-duplicates`
- `low-value-range`
- `adversarial-pivot`

## 2. Baselines

Scores are relative.

For each workload profile and each language, the benchmark system finds the fastest automated entry in the current ranking.

That fastest average becomes the baseline for that dimension.

For each language and each size, the system also finds the fastest `results` value and uses that as the size baseline.

In plain terms:

- best current time in that dimension = baseline
- every other algorithm is scored relative to that baseline

## 3. Dimension Scores

For each:

- language
- workload profile

the benchmark computes an average timing across:

- `small`
- `medium`
- `large`

Then it scores that algorithm against the baseline:

```text
dimensionScore = (baseline / profileAverage) * 100
```

The value is:

- rounded to 1 decimal place
- clamped to the range `0..100`

So:

- fastest entry in a dimension gets `100`
- slower entries get proportionally smaller values

## 4. Size Scores

For each:

- language
- size

the benchmark uses the top-level `results` field.

Because `results` comes from `random-uniform`, size scores are effectively random-uniform-only.

Formula:

```text
sizeScore = (baseline / value) * 100
```

Again:

- rounded to 1 decimal place
- clamped to `0..100`

## 5. Composite Score

The `composite` score is based on workload profiles, not on `results`.

Process:

1. For each workload profile, average that profile's dimension score across languages.
2. Multiply by the workload weight.
3. Divide by the total weight.

Formula:

```text
composite =
  weighted average of profile-average dimension scores
```

Current weights:

- every profile weight is `1`

So today the composite is simply an equal-weight average across all workload profiles.

That means:

- `composite` is not random-uniform-only
- `composite` reflects all current workload profiles equally

## 6. Normalized Score

`normalized` is different from `composite`.

It is the average of all `sizeScores` across:

- Python
- Rust
- C
- small
- medium
- large

Formula:

```text
normalized = average(all sizeScores)
```

Since `sizeScores` come from `results`, and `results` comes from `random-uniform`, the normalized score is effectively based on random-uniform only.

If size scores are missing, the code falls back to `composite`.

## 7. Raw Average

`rawAverageMs` is the average of every numeric workload timing in:

- every workload profile
- every language
- every size

So it is a broad timing average over the full workload snapshot.

It is descriptive, not the main ranking key.

## 8. Percentile

After `composite` is computed for all automated entries:

1. entries are sorted by descending `composite`
2. percentile is assigned from that ranking

Highest composite gets the highest percentile.

So percentile is based on `composite`, not on `normalized`.

## 9. Badges

Badges are heuristic labels added after score calculation.

Current rules:

- `Fast Random` if average `random-uniform` score is at least `92`
- `Handles Duplicates Well` if average `many-duplicates` score is at least `92`
- `Adversarial Ready` if average `adversarial-pivot` score is at least `92`
- `Cross-Language Balanced` if cross-language spread ratio is at most `1.35`
- `Top Overall` if `composite >= 95`

## 10. Practical Summary

If you want the shortest accurate summary:

- displayed `results` use `random-uniform`
- `sizeScores` use `random-uniform`
- `normalized` is built from those size scores, so it is effectively random-uniform-based
- `composite` uses all workload profiles equally
- ranking order for automated entries uses `composite`

## 11. Why This Matters

This means two different questions have two different answers:

### "What timing is shown on the main results view?"

Answer:

- `random-uniform`

### "What score decides the automated ranking?"

Answer:

- `composite`
- built from all workload profiles
- equally weighted under the current configuration
