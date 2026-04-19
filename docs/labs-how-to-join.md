# Sort Labs: How to Join

Sort Labs is the contribution layer around community ranking, benchmark preparation, and seasonal events.

## Ways to Join

You can join Sort Labs in three main ways:

1. Add a new sorting algorithm through a pull request.
2. Join an event and submit an algorithm that matches the current theme.
3. Participate in discussions, bug reports, and feature proposals that shape how Labs works.

## Start With the Algorithm Guide

Before opening a pull request, read:

- [Adding Algorithms](./adding-algorithms.md)
- [Contributor Guide](./contributors.md)
- [Architecture](./architecture.md)

## Submission Flow

1. Create `src/algorithms/<algorithm-slug>/`
2. Add:
   - `meta.json`
   - `steps.ts`
   - `python.py`
   - `rust.rs`
   - `c.c`
3. Register the algorithm in `src/core/algorithms.ts`
4. Run `npm run build`
5. Open a GitHub pull request

## Where to Submit

- New algorithm issue template:
  `https://github.com/T-1234567890/sort-playground/issues/new?template=new_algorithm.yml`
- Feature request template:
  `https://github.com/T-1234567890/sort-playground/issues/new?template=feature_request.md`
- Bug report template:
  `https://github.com/T-1234567890/sort-playground/issues/new?template=bug_report.md`
- GitHub Discussions:
  `https://github.com/T-1234567890/sort-playground/discussions`

## Event Participation

For event-based submissions:

1. Check the current theme on the Labs events page.
2. Make sure the algorithm fits the event scope.
3. Explain the algorithm idea clearly in the PR or issue.
4. Describe the intended visualization, especially if it needs custom rendering.

## What Helps a Submission

- Clear metadata
- Readable step generation
- Educational code snippets
- Honest description of complexity and limitations
- Simple, reviewable custom visualization requirements
