# Community Language Examples

Community Language Examples are optional extra implementations contributed by the community.

This is the feature to use when you want to add your own language example for an existing algorithm.

They do not replace the required core files.

Every algorithm must still include:

- `python.py`
- `rust.rs`
- `c.c`

inside its own algorithm folder.

## Add Your Own Language Example

To add your own language example:

1. pick an existing algorithm folder
2. add your language file directly inside that folder
3. use the supported filename pattern
4. run `npm run build`
5. open a pull request

Example:

```text
src/algorithms/quick-sort/
  python.py
  rust.rs
  c.c
  js.js
```

In that example, `js.js` is an optional community example for Quick Sort.

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

If the community system does not currently include your language, open a GitHub issue and contact the maintainer to consider adding or re-adding that language to the community language system.

Use the issue tracker instead of guessing or adding an unsupported filename format locally.

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

If your language is supported, follow this naming rule exactly so the example can be discovered automatically by the app.

## How Submission Works

Community Language Examples are submitted through a normal pull request.

Submitters should:

1. add the code file directly inside the algorithm folder
2. make sure the filename follows `<language-code>.<extension>`
3. run `npm run build`
4. open a pull request

Recommended pull request scope:

- add one language example at a time when possible
- keep the change focused on that algorithm
- avoid unrelated formatting or refactors

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

If your language is not in the supported list above, it will not be auto-listed in the community UI until the maintainer adds support for it.
