# Sort Playground

**Visualize. Understand. Ship.**

Explore real, weird, and absurd sorting algorithms. Watch every step, copy real implementations, export results, embed visualizations, and contribute your own.

> Watch algorithms, not diagrams.  
> Sort Playground turns code into motion.

Sort Playground is a static React + Vite sorting algorithms playground built for people who learn by watching code move. It mixes classic algorithms, weird experiments, and meme sorts into one developer-friendly interface.

## Get Started

### Visit our site and see it live at [Sort Playground](https://sorting.1234567890.dev/)

<img width="1512" height="641" alt="Screenshot 2026-04-19 at 10 01 30 AM" src="https://github.com/user-attachments/assets/1eda5752-3aa2-4e07-bca4-687ecfa5f770" />

## Why This Exists

Most algorithm explanations are static.

You read code, you see diagrams, but you do not actually see what happens.

Sort Playground exists because watching something change is often easier than trying to imagine it. Each algorithm is broken into small, readable steps and replayed in the browser so you can follow every comparison, swap, overwrite, deletion, and final result.

## What You Can Do

- Watch step-by-step sorting visualizations.
- Explore classic, weird, and meme sorting algorithms.
- Copy real implementations in Python, Rust, and C.
- Export PNGs, GIFs, and share cards.
- Embed a sorter on another page with iframe sharing.
- Add new algorithms through GitHub pull requests.

## Features

### Algorithm Explorer

Browse algorithms by name, category, tags, complexity, and fun factor. The project supports:

- Classic algorithms
- Weird algorithms
- Meme / absurd algorithms

### Visualization Engine

The visualizer uses bar-based steps with clear action states:

- `compare`
- `swap`
- `overwrite`
- `delete`
- `sorted`

Each step includes the current array, action type, and highlighted indices.

### Multi-Language Code

Every algorithm includes copyable implementations:

- Python
- Rust
- C

The code blocks support tabs, copy feedback, line counts, and downloads.

### Export and Sharing

Sort Playground can export:

- PNG result cards
- GIF-style animation captures
- Social share cards
- Embeddable iframe snippets

### Open Source Contribution Flow

Algorithms live in a predictable structure so contributors can add new sorts without touching unrelated app logic.

## Run Locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Build

```bash
npm run build
```

The generated `dist` folder is static and can be deployed to GitHub Pages, Cloudflare Pages, or any static host. `public/404.html` redirects deep links such as `/algo/quick-sort` back into the client app for GitHub Pages-style hosting.

## Project Structure

```text
src/
  algorithms/
  components/
  core/
  i18n/
  legal/
  pages/
```

Algorithm folders follow this shape:

```text
src/algorithms/<algorithm-name>/
  meta.json
  steps.ts
  python.py
  rust.rs
  c.c
```

## Add an Algorithm

Create a folder in `src/algorithms/<algorithm-name>/` with:

```text
meta.json
steps.ts
python.py
rust.rs
c.c
```

`meta.json` powers the explorer card. `steps.ts` exports a function that returns visualization steps:

```ts
type Step = {
  array: number[];
  action: "compare" | "swap" | "overwrite" | "delete" | "sorted";
  indices?: number[];
};
```

Wire the new step function into `src/core/algorithms.ts`.

## Documentation

Project docs live in [`docs/`](./docs/):

- [Architecture](./docs/architecture.md)
- [Adding Algorithms](./docs/adding-algorithms.md)
- [Export Features](./docs/exports.md)
- [Contributor Guide](./docs/contributors.md)
- [Public Roadmap](./docs/roadmap.md)

Contributor and repository docs:

- [Contributing](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)
- [MIT License](./LICENSE)

## Philosophy

This is not just another sorting visualizer.

It is a small project built mostly for fun. It started as something to play with, a way to see algorithms instead of just reading them, and slowly turned into something worth sharing.

No mystery animation. Just values changing, one move at a time.

Open the page. Run the sort. Export the result.

## Maintainer

Maintained by [@T-1234567890](https://github.com/T-1234567890). <br>
Contact via GitHub or [1234567890.dev](https://1234567890.dev).

## Disclaimer

Sort Playground is an educational and experimental project. Algorithm implementations and visualizations are intended for learning, exploration, demos, and fun. They are not guaranteed to be the fastest, most complete, or production-ready versions of each algorithm.

Use the code examples as references, not as a substitute for reviewing, testing, and adapting code for your own project.
