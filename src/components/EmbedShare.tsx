import { Check, Code2, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Algorithm } from "../core/types";

type EmbedShareProps = {
  algorithm: Algorithm;
  className?: string;
};

export function EmbedShare({ algorithm, className = "" }: EmbedShareProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");

  const embedUrl = useMemo(
    () => `https://sorting.1234567890.dev/embed/algo/${algorithm.slug}?controls=minimal`,
    [algorithm.slug],
  );
  const height = size === "small" ? 420 : size === "large" ? 640 : 520;

  const iframeCode = `<iframe
  src="${embedUrl}"
  title="Sort Playground - ${algorithm.name}"
  width="100%"
  height="${height}"
  style="border:0;border-radius:16px;overflow:hidden;"
  loading="lazy"
></iframe>`;

  async function copyEmbedCode() {
    await navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1000);
  }

  return (
    <div className={`rounded-lg border border-zinc-950/10 bg-zinc-950/5 p-4 dark:border-white/10 dark:bg-white/10 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("embed.shareTitle")}</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{t("embed.shareDescription")}</p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("embed.hint")}</p>
        </div>
        <div className="inline-flex rounded-lg border border-zinc-950/10 bg-white/70 p-1 dark:border-white/10 dark:bg-white/10">
          {(["small", "medium", "large"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSize(option)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                size === option
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                  : "text-zinc-600 hover:bg-zinc-950/5 dark:text-zinc-300 dark:hover:bg-white/10"
              }`}
            >
              {t(`embed.sizes.${option}`)}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={copyEmbedCode}
        className={`mt-4 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
          copied
            ? "bg-teal-100 text-teal-900 dark:bg-teal-300/15 dark:text-teal-200"
            : "bg-zinc-950 text-white hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950"
        }`}
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}
        {copied ? t("embed.copied") : t("embed.copy")}
      </button>
      <details className="mt-3 group">
        <summary className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white">
          <Code2 size={15} />
          {t("embed.showCode")}
        </summary>
        <pre className="mt-3 max-h-44 overflow-auto rounded-lg bg-zinc-950 p-3 text-xs leading-5 text-teal-100">
          <code>{iframeCode}</code>
        </pre>
      </details>
    </div>
  );
}
