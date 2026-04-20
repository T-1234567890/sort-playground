import arenaLogo from "../assets/lmarena-ai-icon.svg";
import openAiLogo from "../assets/openai.svg";
import type { BenchmarkLanguage, BenchmarkRankingEntry, BenchmarkSize, ExperimentalLanguageBenchmarkEntry, Step } from "./types";

export type AiProviderId =
  | "chatgpt"
  | "gemini"
  | "claude"
  | "poe"
  | "deepseek"
  | "mistral"
  | "qwen"
  | "manus"
  | "perplexity"
  | "arena"
  | "grok"
  | "meta"
  | "copilot"
  | "githubcopilot";

export type AiProvider = {
  id: AiProviderId;
  label: string;
  logoUrl: string;
  websiteUrl: string;
  supportsPrefill?: boolean;
  buildUrl?: (prompt: string) => string;
};

const PUBLIC_SITE_ORIGIN = "https://sorting.1234567890.dev";
const LOBEHUB_ICON_CDN = "https://unpkg.com/@lobehub/icons-static-svg@latest/icons";

export const aiProviders: AiProvider[] = [
  { id: "chatgpt", label: "ChatGPT", logoUrl: openAiLogo, websiteUrl: "https://chatgpt.com", supportsPrefill: true, buildUrl: (prompt) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}` },
  { id: "gemini", label: "Gemini", logoUrl: `${LOBEHUB_ICON_CDN}/gemini-color.svg`, websiteUrl: "https://gemini.google.com/app", supportsPrefill: true, buildUrl: (prompt) => `https://gemini.google.com/app?q=${encodeURIComponent(prompt)}` },
  { id: "claude", label: "Claude", logoUrl: `${LOBEHUB_ICON_CDN}/claude-color.svg`, websiteUrl: "https://claude.ai/new", supportsPrefill: true, buildUrl: (prompt) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}` },
  { id: "poe", label: "Poe", logoUrl: `${LOBEHUB_ICON_CDN}/poe-color.svg`, websiteUrl: "https://poe.com" },
  { id: "deepseek", label: "DeepSeek", logoUrl: `${LOBEHUB_ICON_CDN}/deepseek-color.svg`, websiteUrl: "https://chat.deepseek.com" },
  { id: "mistral", label: "Mistral", logoUrl: `${LOBEHUB_ICON_CDN}/mistral-color.svg`, websiteUrl: "https://chat.mistral.ai/chat" },
  { id: "qwen", label: "Qwen", logoUrl: `${LOBEHUB_ICON_CDN}/qwen-color.svg`, websiteUrl: "https://chat.qwen.ai/" },
  { id: "manus", label: "Manus", logoUrl: `${LOBEHUB_ICON_CDN}/manus.svg`, websiteUrl: "https://manus.im/app" },
  { id: "perplexity", label: "Perplexity", logoUrl: `${LOBEHUB_ICON_CDN}/perplexity-color.svg`, websiteUrl: "https://www.perplexity.ai" },
  { id: "arena", label: "Arena", logoUrl: arenaLogo, websiteUrl: "https://arena.ai" },
  { id: "grok", label: "Grok", logoUrl: `${LOBEHUB_ICON_CDN}/xai.svg`, websiteUrl: "https://grok.com" },
  { id: "meta", label: "Meta", logoUrl: `${LOBEHUB_ICON_CDN}/metaai-color.svg`, websiteUrl: "https://www.meta.ai/" },
  { id: "copilot", label: "Copilot", logoUrl: `${LOBEHUB_ICON_CDN}/copilot-color.svg`, websiteUrl: "https://copilot.microsoft.com" },
  { id: "githubcopilot", label: "GitHub Copilot", logoUrl: `${LOBEHUB_ICON_CDN}/githubcopilot.svg`, websiteUrl: "https://github.com/features/copilot" },
];

function formatArray(values: number[]) {
  return `[${values.join(", ")}]`;
}

export function getPublicPageUrl(pathname = window.location.pathname) {
  return `${PUBLIC_SITE_ORIGIN}${pathname}`;
}

export function openAiProvider(providerId: AiProviderId, prompt: string) {
  const provider = aiProviders.find((item) => item.id === providerId);

  if (!provider) {
    return false;
  }

  if (!provider.supportsPrefill || !provider.buildUrl) {
    return false;
  }

  window.open(provider.buildUrl(prompt), "_blank", "noopener,noreferrer");
  return true;
}

export function buildStepDescription(step: Step, stepNumber: number, totalSteps: number) {
  return `Step ${stepNumber} of ${totalSteps}, action: ${step.action}, array: ${formatArray(step.array)}.`;
}

export function buildAlgorithmExplainPrompt({
  algorithmName,
  algorithmLink,
  arrayExample,
  stepDescription,
}: {
  algorithmName: string;
  algorithmLink: string;
  arrayExample: number[];
  stepDescription: string;
}) {
  return [
    "Explain this sorting algorithm clearly.",
    "",
    `Algorithm: ${algorithmName}`,
    `Link: ${algorithmLink}`,
    "",
    "Example input:",
    formatArray(arrayExample),
    "",
    "Current step:",
    stepDescription,
  ].join("\n");
}

function formatBenchmarkLines(entry: BenchmarkRankingEntry, languages: BenchmarkLanguage[], sizes: BenchmarkSize[]) {
  return languages
    .map((language) => {
      const parts = sizes
        .map((size) => {
          const value = entry.results?.[language]?.[size];
          return `${size}: ${typeof value === "number" ? `${value} ${entry.unit ?? "ms"}` : "n/a"}`;
        })
        .join(", ");
      return `${language}: ${parts}`;
    })
    .join("\n");
}

export function buildBenchmarkExplainPrompt({
  algorithmName,
  algorithmLink,
  languages,
  results,
}: {
  algorithmName: string;
  algorithmLink: string;
  languages: string[];
  results: string;
}) {
  return [
    "Explain this benchmark result.",
    "",
    `Algorithm: ${algorithmName}`,
    `Link: ${algorithmLink}`,
    "",
    `Languages: ${languages.join(", ")}`,
    "",
    "Results:",
    results,
    "",
    "Explain why performance differs.",
  ].join("\n");
}

export function buildBenchmarkPromptFromEntry({
  entry,
  algorithmLink,
  languageLabels,
}: {
  entry: BenchmarkRankingEntry;
  algorithmLink: string;
  languageLabels: Record<BenchmarkLanguage, string>;
}) {
  const orderedLanguages: BenchmarkLanguage[] = ["python", "rust", "c"];

  return buildBenchmarkExplainPrompt({
    algorithmName: entry.name,
    algorithmLink,
    languages: orderedLanguages.map((language) => languageLabels[language]),
    results: formatBenchmarkLines(entry, orderedLanguages, ["small", "medium", "large"]),
  });
}

export function buildExperimentalBenchmarkPrompt({
  algorithmName,
  algorithmLink,
  entry,
  size,
}: {
  algorithmName: string;
  algorithmLink: string;
  entry: ExperimentalLanguageBenchmarkEntry;
  size: BenchmarkSize;
}) {
  const languages = Object.values(entry.languages).map((language) => language.label);
  const results = Object.entries(entry.languages)
    .map(([languageKey, language]) => `${languageKey}: ${typeof language.results?.[size] === "number" ? `${language.results[size]} ${entry.unit}` : "n/a"}`)
    .join("\n");

  return buildBenchmarkExplainPrompt({
    algorithmName,
    algorithmLink,
    languages,
    results,
  });
}
