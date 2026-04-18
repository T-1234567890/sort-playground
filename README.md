# Sort Playground

A static React + Vite sorting algorithms playground with step-by-step visualization and copyable Python, Rust, and C implementations.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The generated `dist` folder is static and can be deployed to GitHub Pages, Cloudflare Pages, or any static host. `public/404.html` redirects deep links such as `/algo/quick-sort` back into the client app for GitHub Pages-style hosting.

## Documentation

Project docs live in [`docs/`](./docs/):

- [Architecture](./docs/architecture.md)
- [Adding Algorithms](./docs/adding-algorithms.md)
- [Export Features](./docs/exports.md)
- [Contributor Guide](./docs/contributors.md)

## Add an algorithm

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
  action: "compare" | "swap" | "delete" | "sorted";
  indices?: number[];
};
```

Wire the new step function into `src/core/algorithms.ts`; the raw source files and metadata are loaded by Vite glob imports.
