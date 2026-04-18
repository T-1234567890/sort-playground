# Adding Algorithms

Add a new folder under:

```text
src/algorithms/<algorithm-slug>/
```

Required files:

```text
meta.json
steps.ts
python.py
rust.rs
c.c
```

## `meta.json`

Example:

```json
{
  "name": "Example Sort",
  "category": "classic",
  "complexity": "O(n log n)",
  "spaceComplexity": "O(n)",
  "stability": "Stable",
  "description": "A concise description of the algorithm.",
  "author": "T-1234567890",
  "contributors": ["T-1234567890"],
  "added": "2026-04-19",
  "keywords": ["classic", "fast"],
  "funRank": 3
}
```

Categories must be one of:

- `classic`
- `weird`
- `meme`

## `steps.ts`

Export a function that accepts a number array and returns visualization steps.

```ts
import type { Step } from "../../core/types";

export function exampleSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  // Push compare, swap, delete, and sorted steps here.

  steps.push({
    array: [...array].sort((a, b) => a - b),
    action: "sorted",
    indices: array.map((_, index) => index),
  });

  return steps;
}
```

## Wire the Step Function

After adding the folder, import and register the step function in:

```text
src/core/algorithms.ts
```

This is the only manual registry step.

## Source Snippets

The three language files are displayed directly in the UI and can be downloaded by users:

- `python.py`
- `rust.rs`
- `c.c`

Keep snippets readable, standalone, and educational.
