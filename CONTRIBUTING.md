# Contributing to Sort Playground

Thanks for helping improve Sort Playground.

This project is a static sorting algorithm playground. Contributions should keep the app lightweight, understandable, and easy to run locally.

## Ways to Contribute

- Add a classic, weird, or meme sorting algorithm.
- Improve an existing visualization.
- Fix UI bugs or accessibility issues.
- Improve docs, examples, or contributor workflows.
- Add small product improvements that make the playground easier to use.

## Local Setup

```bash
npm install
npm run dev
```

Before opening a pull request, run:

```bash
npm run build
```

## Adding an Algorithm

Create a new folder:

```text
src/algorithms/<algorithm-name>/
```

Include:

```text
meta.json
steps.ts
python.py
rust.rs
c.c
```

Then wire the algorithm into:

```text
src/core/algorithms.ts
```

## Algorithm Requirements

Each algorithm should include:

- Clear metadata in `meta.json`.
- Step-by-step visualization data in `steps.ts`.
- Python implementation.
- Rust implementation.
- C implementation.
- A useful description that explains why the algorithm is interesting.

Supported categories:

- `classic`
- `weird`
- `meme`

Visualization steps should use the shared step format:

```ts
type Step = {
  array: number[];
  action: "compare" | "swap" | "overwrite" | "delete" | "sorted";
  indices?: number[];
};
```

## Custom Visualizations

Default bar visualization is preferred for most algorithms.

Custom visualization is welcome when the algorithm needs a different visual model, such as:

- gravity-based sorting
- timing-based sorting
- deletion-heavy sorting
- intentionally chaotic meme sorting

If you add a custom visualization, keep it small, static-friendly, and easy to review.

## Pull Requests

Use the matching pull request template:

- Add algorithm
- Core update
- Bug fix
- Maintenance

Good pull requests are:

- focused
- readable
- easy to test
- free of unrelated formatting churn

## Code Style

- Follow the existing React, TypeScript, and Tailwind patterns.
- Keep components small and direct.
- Avoid heavy dependencies.
- Do not add a backend, database, or authentication.
- Prefer simple, static-friendly solutions.

## UI Guidelines

- Keep the interface calm and developer-friendly.
- Preserve the current glass/minimal style.
- Make controls clear and touch-friendly.
- Check responsive behavior before submitting UI changes.

## Reporting Bugs

Use the Bug report issue template and include:

- browser
- device
- steps to reproduce
- screenshots if relevant

## License

By contributing, you agree that your contributions are licensed under the MIT License.
