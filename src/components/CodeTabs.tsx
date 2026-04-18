import { Check, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { downloadTextFile } from "../core/exporters";
import type { Algorithm, CodeSnippets } from "../core/types";

const tabs = [
  { id: "python", label: "Python" },
  { id: "rust", label: "Rust" },
  { id: "c", label: "C" },
] as const;

type TabId = (typeof tabs)[number]["id"];

type CodeTabsProps = {
  algorithm: Algorithm;
  snippets: CodeSnippets;
};

const fileExtensions: Record<TabId, string> = {
  python: "py",
  rust: "rs",
  c: "c",
};

export function CodeTabs({ algorithm, snippets }: CodeTabsProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState<TabId>("python");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const code = snippets[active];

  const languageLabel = useMemo(() => tabs.find((tab) => tab.id === active)?.label ?? "Code", [active]);
  const lineCount = useMemo(() => code.trimEnd().split("\n").length, [code]);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 950);
  }

  function downloadCode(language: TabId) {
    downloadTextFile(snippets[language], `${algorithm.slug}.${fileExtensions[language]}`);
  }

  function downloadAll() {
    tabs.forEach((tab, index) => {
      window.setTimeout(() => downloadCode(tab.id), index * 120);
    });
  }

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-950/10 bg-zinc-950 text-zinc-50 shadow-soft dark:border-white/10">
      <div className="border-b border-white/10 bg-zinc-950 px-3 py-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-lg bg-white/8 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActive(tab.id);
                    setExpanded(false);
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    active === tab.id ? "bg-teal-400 text-zinc-950" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold uppercase text-zinc-400">
              {languageLabel} · {t("code.lines", { count: lineCount })}
            </span>
          </div>
          <button
            type="button"
            onClick={copyCode}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              copied
                ? "border-teal-400 bg-teal-400 text-zinc-950"
                : "border-white/10 text-zinc-100 hover:bg-white/10"
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? t("code.copied") : t("code.copy", { language: languageLabel })}
          </button>
        </div>
      </div>
      <pre className={`${expanded ? "max-h-[680px]" : "max-h-64"} overflow-auto p-5 text-sm leading-6 transition-[max-height] duration-300`}>
        <code>{code}</code>
      </pre>
      <div className="border-t border-white/10 p-3">
        <div className="mb-3 grid gap-2 sm:grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => downloadCode(tab.id)}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
            >
              {t("code.download", { language: tab.label })}
            </button>
          ))}
          <button
            type="button"
            onClick={downloadAll}
            className="rounded-lg bg-teal-400 px-3 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-teal-300"
          >
            {t("code.downloadAll")}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white/8 px-4 py-2 text-sm font-semibold transition hover:bg-white/12"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {expanded ? t("code.collapse") : t("code.showFull")}
        </button>
      </div>
    </section>
  );
}
