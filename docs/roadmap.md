# Sort Playground Roadmap

This roadmap is public, lightweight, and intentionally practical.

Sort Playground is a visual playground for real, weird, and absurd sorting algorithms. The goal is to make algorithms easier to understand, more fun to explore, and easier for contributors to extend.

Priorities may change as contributors join, but these are the main directions for the project.

## Status

| Item | Status  | Notes |
| --- |---------| --- |
| Compare Mode | Shipped | Two-algorithm side-by-side view with shared input, synced controls, and basic stats. |
| Race Mode | Shipped | Multi-algorithm race view with shared input, synced controls, progress, and finish ranking. |
| Permalink Sharing | Planned | Needed for shareable demos and better embeds. |
| More Meme Algorithms | Planned | Good first-issue candidate. |
| Contribution Leaderboard | Planned | Should remain static and GitHub-friendly. |
| Better Embed Customization | Planned | Builds on current embed route. |
| Contribution Wizard | Shipped | First target is an educational `/contribute` page with copyable starter templates. |
| Step Scrubber | MVP Shipped    | Should integrate with Visual Mode and Explain Mode. |
| Community Language Examples | Shipped | Optional panel below required Python / Rust / C snippets. |

## 1. Compare Mode

Run two algorithms side by side on the same input array.

Example:

- Quick Sort vs Bubble Sort
- Merge Sort vs Insertion Sort
- Bogo Sort vs Bozo Sort

Why it matters:

- Helps users understand tradeoffs visually.
- Makes algorithm differences obvious.
- Creates more shareable demos.

Possible features:

- shared input array
- synced start / pause / reset controls
- comparison stats
- side-by-side bar visualizations
- final result comparison

Brief plan:

1. Create a `/compare` page with two algorithm selectors and one shared input array.
2. Reuse the existing step generation model so both algorithms receive the same starting array.
3. Add synced controls for start, pause, reset, speed, and randomize.
4. Show lightweight stats such as step count, comparisons, swaps, deletes, and completion state.
5. Add share/export support after the basic comparison flow is stable.

## 2. Race Mode

Let multiple algorithms race against each other.

Why it matters:

- Fun, visual, and highly shareable.
- Great for meme algorithms.
- Makes performance differences feel immediate.

Possible features:

- select 2-6 algorithms
- same starting array for every algorithm
- live progress bars
- winner label
- funny loss states for intentionally bad algorithms

Brief plan:

1. Reuse Compare Mode primitives for shared input, synchronized timing, and progress tracking.
2. Add a race setup panel where users choose 2-6 algorithms.
3. Render each algorithm as a compact lane with bars, progress, and current action.
4. Track completion order and show a winner state.
5. Add fun labels for intentionally slow or chaotic algorithms without hiding real progress data.

## 3. Permalink Sharing

Allow users to share a specific visualization state through the URL.

Example:

```text
/algo/quick-sort?array=9,4,1,8,2&speed=2&theme=dark
```

Why it matters:

- Makes examples easy to share.
- Supports blog posts, docs, classrooms, and demos.
- Makes embed customization easier later.

Possible parameters:

- algorithm
- array
- speed
- theme
- mode
- sound

## 4. More Meme Algorithms

Add more cursed, funny, inefficient, or absurd sorting algorithms.

Why it matters:

- Meme algorithms are part of what makes Sort Playground different.
- They are fun to share.
- They make the project feel less like a generic visualizer.

Candidates:

- Thanos Sort
- Quantum Bogo Sort
- Bogobogo Sort
- Pancake Sort
- Stooge Sort
- Slow Sort
- Miracle Sort variants
- Sleep Sort variants

Contribution notes:

- Meme algorithms should still include real code examples.
- If an algorithm is intentionally impossible or joke-based, document the joke clearly.
- Keep visualizations understandable.

## 5. Contribution Leaderboard

Show contributors who have added algorithms, improved visualizations, or helped maintain the project.

Why it matters:

- Rewards contributors.
- Encourages more open-source participation.
- Makes the project feel alive.

Possible features:

- contributor avatars
- algorithms contributed
- recent contributions
- maintainer highlights
- links to GitHub profiles

Implementation should stay static:

- no API calls required at runtime
- data can be generated or stored locally
- GitHub avatars can use `https://github.com/{username}.png`

## 6. Better Embed Customization

Improve iframe embeds so people can place Sort Playground inside docs, blogs, and project pages.

Why it matters:

- Embeds turn users into distribution.
- Blog posts and tutorials can include live algorithm demos.
- Makes the project more useful outside the main site.

Possible options:

```text
/embed/algo/quick-sort?theme=dark&controls=minimal&array=5,3,1,4,2
```

Customization ideas:

- theme: light / dark / system
- controls: none / minimal / full
- custom array
- speed
- show or hide branding
- fixed height presets
- start automatically

## 7. Contribution Wizard

Create a page that explains how the whole contribution system works.

Goal:

Help someone add a new algorithm without reading the entire codebase.

The page should explain:

- how algorithms are structured
- what `meta.json` does
- what `steps.ts` does
- how Python / Rust / C snippets are loaded
- how visualization steps work
- how to submit a pull request

Possible route:

```text
/contribute
```

Possible sections:

- choose algorithm type
- create the folder
- write metadata
- generate steps
- add code examples
- test locally
- open a PR

Nice-to-have:

- copyable starter templates
- example `meta.json`
- example `steps.ts`
- links to the correct PR template

Brief plan:

1. Add a `/contribute` page focused on explaining the algorithm contribution system.
2. Show the required folder structure and explain each file in plain language.
3. Include copyable starter templates for `meta.json`, `steps.ts`, and code files.
4. Link to issue templates, PR templates, contributing docs, and the GitHub repository.
5. Add a checklist so first-time contributors can verify their algorithm before opening a PR.

## 8. Step Scrubber

Add a timeline slider that lets users manually move through sorting steps.

Why it matters:

- Users can inspect important moments.
- Educators can pause and explain.
- Complex algorithms become easier to understand.

Possible features:

- draggable timeline
- keyboard step forward/back
- current action marker
- step count display
- jump to start / end

The scrubber should work with:

- Visual Mode
- Explain Mode
- exports where possible

## 9. Community Language Examples

Add an optional panel for extra language implementations contributed by the community.

Current required languages:

- Python
- Rust
- C

Optional community examples could include:

- JavaScript
- TypeScript
- Go
- Java
- C++
- Swift
- Kotlin
- Zig
- Ruby

Why it matters:

- Makes the project more useful to more developers.
- Encourages smaller contributions.
- Lets contributors add examples without changing the core algorithm model.

Possible design:

- required tabs stay visible
- optional "Community examples" panel below
- language metadata includes contributor credit
- examples can be collapsed by default

## Long-Term Direction

Sort Playground should stay:

- static
- fast
- open-source friendly
- easy to contribute to
- fun enough to share

The project should not become a heavy algorithm encyclopedia. The best version is a focused playground where users can quickly watch, understand, copy, export, embed, and contribute sorting algorithms.

## How to Help

Pick one roadmap item and open an issue or pull request.

Good first contributions:

- add a meme algorithm
- improve an explanation
- add a community language example
- polish mobile layout
- improve embed options
- add starter templates for the contribution wizard
