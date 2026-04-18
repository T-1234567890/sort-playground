# Export Features

Sort Playground supports visual and code exports entirely in the browser.

## Visual Exports

Available from the algorithm visualizer:

- `Export PNG`
- `Export Share Card`
- `Export GIF`

Exports are disabled while an animation is running to avoid capturing unstable state.

## PNG Export

PNG export renders a clean result card with:

- algorithm name
- complexity
- result array
- simplified bar visualization
- Sort Playground branding

The fixed hidden export component is:

```text
src/components/ExportCard.tsx
```

The canvas renderer is:

```text
src/core/exporters.ts
```

## Share Card Export

Share-card export renders a larger social-style image with centered content and a subtle gradient background.

It includes:

- algorithm name
- result
- complexity
- branding

## GIF Export

GIF export samples a limited number of animation frames for performance.

Implementation notes:

- Frames are reduced to a small palette.
- Resolution is intentionally compact.
- A lightweight local GIF encoder is used instead of a heavy dependency.

## Code Exports

The code block supports:

- copy active language
- download Python
- download Rust
- download C
- download all files as separate downloads

ZIP export is intentionally avoided to keep the bundle small.
