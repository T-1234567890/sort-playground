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

  const embedUrl = useMemo(() => {
    const origin = window.location.origin;
    return `${origin}/embed/algo/${algorithm.slug}?controls=minimal`;
  }, [algorithm.slug]);

  const iframeCode = `<iframe
  src="${embedUrl}"
  title="Sort Playground - ${algorithm.name}"
  width="100%"
  height="520"
  style="border:0;border-radius:16px;overflow:hidden;"
  loading="lazy"
></iframe>`;

  async function copyEmbedCode() {
    await navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1000);
  }

  return (
    <div className={`rounded-lg bg-zinc-950/5 p-3 dark:bg-white/10 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("embed.shareTitle")}</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{t("embed.shareDescription")}</p>
        </div>
        <button
          type="button"
          onClick={copyEmbedCode}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            copied
              ? "bg-teal-100 text-teal-900 dark:bg-teal-300/15 dark:text-teal-200"
              : "bg-zinc-950 text-white hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950"
          }`}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? t("embed.copied") : t("embed.copy")}
        </button>
      </div>
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
