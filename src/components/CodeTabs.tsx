import { Check, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { downloadTextFile } from "../core/exporters";
import type { Algorithm, CodeSnippets, CommunityCodeExample } from "../core/types";

const repoBaseUrl = "https://github.com/T-1234567890/sort-playground/blob/main";

const tabs = [
  { id: "python", label: "Python" },
  { id: "rust", label: "Rust" },
  { id: "c", label: "C" },
] as const;

const supportedCommunityLanguages = [
  "JavaScript",
  "TypeScript",
  "Go",
  "Java",
  "C++",
  "Swift",
  "Kotlin",
  "Zig",
  "Ruby",
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

function extensionFromFilename(filename: string) {
  return filename.split(".").pop() ?? "txt";
}

type CommunityExampleCardProps = {
  algorithm: Algorithm;
  example: CommunityCodeExample;
};

function CommunityExampleCard({ algorithm, example }: CommunityExampleCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const lineCount = useMemo(() => example.code.trimEnd().split("\n").length, [example.code]);

  async function copyCode() {
    await navigator.clipboard.writeText(example.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 950);
  }

  function downloadCode() {
    downloadTextFile(example.code, `${algorithm.slug}.${example.id}.${extensionFromFilename(example.file)}`);
  }

  const githubFileUrl = example.sourceUrl ?? `${repoBaseUrl}/src/algorithms/${algorithm.slug}/${example.file}`;

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-950/10 bg-white/72 dark:border-white/10 dark:bg-white/8">
      <div className="flex flex-col gap-3 border-b border-zinc-950/10 px-4 py-4 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-semibold">{example.label ?? example.language}</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {example.contributor ? `${t("code.communityBy", { contributor: example.contributor })} · ` : ""}{t("code.lines", { count: lineCount })}
          </p>
          <a href={githubFileUrl} className="mt-2 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-300 dark:hover:text-teal-200">
            {t("code.communitySource")}
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyCode}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              copied
                ? "border-teal-400 bg-teal-400 text-zinc-950"
                : "border-zinc-950/10 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15"
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? t("code.copied") : t("code.copy", { language: example.language })}
          </button>
          <button
            type="button"
            onClick={downloadCode}
            className="rounded-lg border border-zinc-950/10 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15"
          >
            {t("code.download", { language: example.language })}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {expanded ? t("code.collapse") : t("code.showFull")}
          </button>
        </div>
      </div>

      {expanded ? (
        <pre className="overflow-auto bg-zinc-950 p-5 text-sm leading-6 text-zinc-50">
          <code>{example.code}</code>
        </pre>
      ) : null}
    </div>
  );
}

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
    <div className="space-y-5">
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

      <section className="rounded-lg border border-zinc-950/10 bg-zinc-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">{t("code.communityEyebrow")}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">{t("code.communityTitle")}</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("code.communityDescription")}</p>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("code.communityRequired")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {supportedCommunityLanguages.map((language) => (
              <span
                key={language}
                className="rounded-lg border border-zinc-950/10 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 dark:border-white/10 dark:bg-white/10 dark:text-zinc-200"
              >
                {language}
              </span>
            ))}
          </div>
        </div>

        {algorithm.communityExamples?.length ? (
          <div className="mt-5 grid gap-4">
            {algorithm.communityExamples.map((example) => (
              <CommunityExampleCard key={example.id} algorithm={algorithm} example={example} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-zinc-950/10 bg-white/70 px-4 py-5 text-sm leading-6 text-zinc-600 dark:border-white/10 dark:bg-white/8 dark:text-zinc-300">
            {t("code.communityEmpty")}
          </div>
        )}
      </section>
    </div>
  );
}
