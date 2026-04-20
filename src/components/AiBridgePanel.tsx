import { Copy } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { aiProviders, openAiProvider, type AiProviderId } from "../core/aiBridge";

type AiBridgePanelProps = {
  title: string;
  prompt: string;
  defaultProvider?: AiProviderId;
};

export function AiBridgePanel({ title, prompt, defaultProvider = "chatgpt" }: AiBridgePanelProps) {
  const { t } = useTranslation();
  const [activeProvider, setActiveProvider] = useState<AiProviderId>(defaultProvider);
  const [copyState, setCopyState] = useState<"idle" | "done">("idle");
  const [tipVisible, setTipVisible] = useState(false);

  function providerPrompt(providerId: AiProviderId) {
    if (providerId === "githubcopilot") {
      return `${prompt}\n\nRepository reference:\nhttps://github.com/T-1234567890/sort-playground`;
    }

    return prompt;
  }

  function showCopiedTip() {
    setTipVisible(true);
    window.setTimeout(() => setTipVisible(false), 1000);
  }

  async function copyPrompt(providerId?: AiProviderId) {
    await navigator.clipboard.writeText(providerPrompt(providerId ?? activeProvider));
    setCopyState("done");
    showCopiedTip();
    window.setTimeout(() => setCopyState("idle"), 1200);
  }

  function handleProviderClick(providerId: AiProviderId) {
    setActiveProvider(providerId);
    const opened = openAiProvider(providerId, providerPrompt(providerId));

    if (!opened) {
      void copyPrompt(providerId);
      const provider = aiProviders.find((item) => item.id === providerId);

      if (provider?.websiteUrl) {
        window.setTimeout(() => {
          window.open(provider.websiteUrl, "_blank", "noopener,noreferrer");
        }, 1000);
      }
    }
  }

  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white/72 p-4 shadow-sm dark:border-white/10 dark:bg-white/8">
      {tipVisible ? (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 animate-[fade-in_180ms_ease-out] rounded-lg border border-emerald-500/20 bg-emerald-100/80 px-3 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/10 backdrop-blur-md dark:border-emerald-300/20 dark:bg-emerald-300/12 dark:text-emerald-100">
          Prompt copied to clipboard
        </div>
      ) : null}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">{title}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-stretch gap-2">
          {aiProviders.map((provider) => {
            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => handleProviderClick(provider.id)}
                title={provider.label}
                aria-label={provider.label}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold outline-none transition ${
                  provider.id === "chatgpt"
                    ? "border-zinc-950/10 bg-white text-zinc-700 hover:border-teal-500/60 hover:bg-zinc-50 dark:border-white/10 dark:bg-white dark:text-zinc-950 dark:hover:border-teal-300/60"
                    : "border-zinc-950/10 bg-white text-zinc-700 hover:border-teal-500/60 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:border-teal-300/60 dark:hover:bg-white/15"
                }`}
              >
                <img
                  src={provider.logoUrl}
                  alt={provider.label}
                  className={`rounded-sm object-contain ${provider.id === "chatgpt" ? "h-6 w-6" : "h-5 w-5"}`}
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => {
            void copyPrompt();
          }}
          className="inline-flex h-10 w-auto shrink-0 items-center justify-center gap-2 rounded-lg border border-zinc-950/10 bg-white px-3 py-0 text-sm font-semibold leading-none text-zinc-900 transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-zinc-950"
        >
          {copyState === "done" ? null : <Copy size={15} />}
          {copyState === "done" ? t("aiBridge.copied") : t("aiBridge.copyPrompt")}
        </button>
      </div>
    </div>
  );
}
