# Explain with AI Prompts

This document defines the prompt formats used by `Explain with AI`.

## Algorithm prompt

```text
Explain this sorting algorithm clearly.

Algorithm: {algorithmName}
Link: {publicAlgorithmUrl}

Example input:
{array}

Current step:
{stepDescription}
```

Used on:

- algorithm detail pages

## Benchmark prompt

```text
Explain this benchmark result.

Algorithm: {algorithmName}
Link: {publicBenchmarkUrl}

Languages: {languages}

Results:
{results}

Explain why performance differs.
```

Used on:

- benchmark detail pages
- more-language benchmark overview
- more-language benchmark detail pages

## Prompt rules

- Keep prompts short
- Use the public production URL
- Include only current page context
- Do not include internal implementation notes
- Do not include localhost links

## Current public origin

```text
https://sorting.1234567890.dev
```

## Provider behavior

Verified prefill providers currently open a new tab with an encoded prompt.

Other providers fall back to prompt copy.
