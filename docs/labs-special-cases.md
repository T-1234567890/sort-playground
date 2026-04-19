# Sort Labs: Special Cases

Some algorithms fit poorly into normal rankings or automated benchmark systems. Labs should handle those cases explicitly.

## Benchmark-Exempt Algorithms

The following kinds of algorithms may be excluded from benchmark ranking:

- meme sorts with intentionally absurd runtime
- algorithms that depend on randomness
- algorithms that wait for external change
- user-driven or manual sorts
- algorithms whose visualization is the point more than raw runtime

Examples include:

- Bozo Sort
- Miracle Sort
- Manual Sort

These algorithms can still appear in Labs, but they should not be shown with misleading benchmark numbers.

## Custom Visualization Cases

Some algorithms need a custom renderer or extra metadata beyond the default bars.

Typical examples:

- bead or gravity-style sorts
- deletion-based sorts
- timing-based joke sorts
- manual drag-and-drop interaction

If a sort needs custom visualization:

1. keep the default step output valid
2. describe the extra visual data clearly
3. keep the renderer optional and reviewable

## No-Data States

If a ranking, benchmark, or event board has no trustworthy data yet, the UI should:

- show a clear loading or collection placeholder
- avoid fake leaderboards
- explain that data is still being collected
- invite contributors to come back later or submit an entry

## Event Edge Cases

Event ranking should stay hidden when:

- there are no valid submissions
- the event has not started
- scoring rules are still changing
- the current season is documentation-only

## Contribution Review Edge Cases

Maintainers may ask for revision when:

- metadata is incomplete
- step generation does not match the animation
- custom visualization is underspecified
- code files are missing
- the algorithm duplicates an existing entry without a meaningful difference
