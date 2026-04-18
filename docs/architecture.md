# Architecture

Sort Playground is fully static. There is no backend, database, or authentication layer.

## Stack

- React
- Vite
- Tailwind CSS
- TypeScript
- Browser-native Web Audio and Canvas APIs

## Routing

Routing is handled in `src/App.tsx` with a small client-side router:

- `/` renders the algorithm explorer.
- `/algo/:name` renders an algorithm detail page.
- `/about` renders the About page.

`public/404.html` redirects deep links back into the SPA for static hosting.

## Algorithm Loading

Algorithm metadata and source snippets live under `src/algorithms/<slug>/`.

`src/core/algorithms.ts` loads:

- `meta.json` through Vite glob imports
- `python.py`, `rust.rs`, and `c.c` as raw text
- `steps.ts` through explicit step-function imports

## Visualization

`src/components/Visualizer.tsx` owns:

- array state
- animation step index
- speed controls
- sound controls
- export actions
- Visual Mode / Explain Mode

Step data follows this shape:

```ts
type Step = {
  array: number[];
  action: "compare" | "swap" | "delete" | "sorted";
  indices?: number[];
};
```

## Exports

Export utilities live in `src/core/exporters.ts`.

They use browser-native APIs:

- Canvas for PNG/share-card rendering
- a lightweight GIF writer for animation export
- Blob downloads for source files

No server work is required.
