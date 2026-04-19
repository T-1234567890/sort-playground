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
  js.js
  ts.ts
  go.go
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

Required convention:

- community examples live directly inside the algorithm folder
- no nested `community/` folder is required
- no `community-examples.json` file is required
- use `<language-code>.<extension>`

Examples:

- `js.js`
- `ts.ts`
- `go.go`
- `java.java`
- `swift.swift`

## How Submission Works

Community Language Examples are submitted through a normal pull request.

Submitters should:

1. add the code file directly inside the algorithm folder
2. make sure the filename follows `<language-code>.<extension>`
3. run `npm run build`
4. open a pull request

## Example Folders In This Repo

Current examples:

- `src/algorithms/quick-sort/js.js`
- `src/algorithms/merge-sort/ts.ts`
- `src/algorithms/bubble-sort/js.js`
- `src/algorithms/bubble-sort/go.go`

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
  - GitHub file link
  - download button
  - copy button

If no community examples exist, the detail page still shows the section with an empty state.
