# Events

Events are the Labs area for seasonal prompts and themed submissions.

## What It Is

An event page should explain the current season before it tries to show standings.

That includes:

- the theme
- the time window
- the categories
- how to participate

## Requirements

| Requirement | Rule |
| --- | --- |
| Required identity field | `Algorithm:` slug must be consistent |
| Event field | must match the exact event name |
| Current exact event string | `Sort Labs Challenge Season 2026-1` |
| Implemented submission files | `meta.json`, `steps.ts`, `python.py`, `rust.rs`, `c.c` |

## What the Page Should Do

- explain the current event clearly
- give contributors a direct participation path
- hold ranking space for later

## Submission Format

```md
## Event

- [x] Participate in current event

Event:
Sort Labs Challenge Season 2026-1
```

Event name must match exactly to be recognized.

## Ranking Policy

If submissions are still being collected, the event board should stay in placeholder mode. Real standings should only appear after there is enough valid data to show.

## Output Shape

- `event id`
- `entries`
