# Community Language Examples

Community Language Examples are optional extra implementations contributed by the community.

They do not replace the required core files.

Every algorithm must still include:

- `python.py`
- `rust.rs`
- `c.c`

inside its own algorithm folder.

## Folder Structure

Use this structure inside an algorithm folder:

```text
src/algorithms/<algorithm-slug>/
  meta.json
  steps.ts
  python.py
  rust.rs
  c.c
  community-examples.json
  community/
    <algorithm-slug>.js
    <algorithm-slug>.ts
```

## Supported Community Languages

The current loader supports:

- JavaScript
- TypeScript
- Go
- Java
- C++
- Swift
- Kotlin
- Zig
- Ruby

## Naming Convention

Recommended convention:

- metadata file: `community-examples.json`
- code folder: `community/`
- code file: `<algorithm-slug>.<ext>`
- metadata id: `<language>-community`

Examples:

- `quick-sort.js`
- `merge-sort.ts`
- `javascript-community`
- `typescript-community`

## Metadata Format

Example:

```json
[
  {
    "id": "javascript-community",
    "language": "JavaScript",
    "file": "quick-sort.js",
    "contributor": "your-github-name",
    "label": "JavaScript Community Example"
  }
]
```

Fields:

- `id`: stable identifier for the example
- `language`: display language name
- `file`: filename inside `community/`
- `contributor`: GitHub username
- `label`: optional display label
- `contributorUrl`: optional override
- `sourceUrl`: optional override for GitHub file link

## How Submission Works

Community Language Examples are submitted through a normal pull request.

Submitters should:

1. add the code file under `community/`
2. add or update `community-examples.json`
3. make sure the filename matches the metadata
4. run `npm run build`
5. open a pull request

## Example Folders In This Repo

Current examples:

- `src/algorithms/quick-sort/community-examples.json`
- `src/algorithms/quick-sort/community/quick-sort.js`
- `src/algorithms/merge-sort/community-examples.json`
- `src/algorithms/merge-sort/community/merge-sort.ts`
- `src/algorithms/bubble-sort/community-examples.json`
- `src/algorithms/bubble-sort/community/bubble-sort.js`
- `src/algorithms/bubble-sort/community/bubble-sort.go`

These are example community submissions included in the repo to show the intended structure and naming pattern.

In particular, Bubble Sort now includes two example community versions:

- JavaScript
- Go

They exist as examples for contributors, not as extra required files.

## Frontend Behavior

On the algorithm detail page:

- required Python / Rust / C code appears first
- Community Versions appears below
- each community example shows:
  - language
  - contributor
  - GitHub file link
  - download button
  - copy button

If no community examples exist, the detail page still shows the section with an empty state.
