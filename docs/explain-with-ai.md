# Explain with AI

`Explain with AI` is a client-side bridge from Sort Playground to external AI tools.

It does not use:

- built-in model calls
- API keys
- backend services

Instead, the app generates a prompt locally, then either:

- opens a supported provider with the prompt in the URL
- or falls back to copying the prompt

## Where it appears

- Algorithm detail pages
- Benchmark detail pages
- More-language benchmark overview
- More-language benchmark detail pages

## What it uses

The feature builds prompts from the current page context, including:

- algorithm name
- public page URL
- sample or current array data
- benchmark language results
- current benchmark size when relevant

## Public URL rule

Prompts always use the public site origin:

`https://sorting.1234567890.dev`

They do not use localhost or local dev ports.

## Providers

Current provider row:

- ChatGPT
- Gemini
- Claude
- Poe
- DeepSeek
- Mistral
- Qwen
- MiniMax
- Manus

Some providers support verified URL prompt prefill. Others currently use copy fallback only.

## Fallback behavior

If prompt prefill is not supported or not verified for a provider:

- clicking the provider copies the prompt
- the user can paste it into that tool manually

## Design rule

The UI stays intentionally small:

- one title
- one provider row
- one copy button

No textarea preview, no backend status, no extra chat UI.
