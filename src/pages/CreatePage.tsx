import { ArrowLeft, ArrowUpRight, ChevronRight, Copy, FolderOpen, GitBranch, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import {
  stripPreviewOnlyImports,
  type LoadedAlgorithmDraft,
} from "../core/createAlgorithm";
import type { AlgorithmCategory } from "../core/types";
import { randomArray } from "../core/visualizer";

type CreatePageProps = {
  dark: boolean;
  onToggleDark: () => void;
};

type Notice = {
  kind: "success" | "error";
  title: string;
  body: string;
};

type PreviewWorkerResult =
  | {
      id: number;
      ok: true;
      steps: Array<unknown>;
    }
  | {
      id: number;
      ok: false;
      error: string;
    };

type LocalTestResult = {
  durationMs: number;
  stepCount: number;
};

const repoUrl = "https://github.com/T-1234567890/sort-playground";
const categoryOptions: AlgorithmCategory[] = ["classic", "weird", "meme"];

function buildNearlySortedDataset(size = 12) {
  const values = randomArray(size).sort((left, right) => left - right);

  if (values.length > 3) {
    const swapIndex = Math.max(1, Math.floor(values.length / 3));
    [values[swapIndex], values[swapIndex + 1]] = [values[swapIndex + 1], values[swapIndex]];
  }

  return values;
}

function buildReverseSortedDataset(size = 12) {
  return randomArray(size).sort((left, right) => right - left);
}

function buildManyDuplicatesDataset(size = 12) {
  return Array.from({ length: size }, (_, index) => [18, 24, 31, 31, 42, 42][index % 6]);
}

type ToolsModeSectionProps = {
  code: string;
  loadedAlgorithm: LoadedAlgorithmDraft | null;
  loadResult: Notice | null;
  isLoadingAlgorithm: boolean;
  name: string;
  slug: string;
  category: AlgorithmCategory;
  description: string;
  sampleArray: number[];
  onNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onCategoryChange: (value: AlgorithmCategory) => void;
  onDescriptionChange: (value: string) => void;
  onSampleArrayChange: (nextArray: number[]) => void;
  onLoadExistingAlgorithm: () => void | Promise<void>;
};

type ToolsAccordionItemProps = {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function ToolsAccordionItem({ title, open, onToggle, children }: ToolsAccordionItemProps) {
  return (
    <section className="rounded-2xl border border-zinc-950/10 bg-white/75 px-4 py-3 dark:border-white/10 dark:bg-white/8">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-lg font-semibold tracking-tight">{title}</span>
        <ChevronRight
          size={18}
          className={`shrink-0 text-zinc-500 transition-transform duration-200 dark:text-zinc-400 ${open ? "rotate-90" : ""}`}
        />
      </button>

      <div className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-200 ease-out ${open ? "mt-4 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"}`}>
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </section>
  );
}

export function ToolsModeSection({
  code,
  loadedAlgorithm,
  loadResult,
  isLoadingAlgorithm,
  name,
  slug,
  category,
  description,
  sampleArray,
  onNameChange,
  onSlugChange,
  onCategoryChange,
  onDescriptionChange,
  onSampleArrayChange,
  onLoadExistingAlgorithm,
}: ToolsModeSectionProps) {
  const { t } = useTranslation();
  const [jsonCopied, setJsonCopied] = useState(false);
  const [localTestResult, setLocalTestResult] = useState<LocalTestResult | null>(null);
  const [localTestError, setLocalTestError] = useState<string | null>(null);
  const [isRunningLocalTest, setIsRunningLocalTest] = useState(false);
  const [datasetSize, setDatasetSize] = useState<"small" | "medium">("small");
  const [openTool, setOpenTool] = useState<"json" | "test" | "datasets" | null>(null);
  const testCode = loadedAlgorithm?.files["steps.ts"] ?? code;
  const activeSourceLabel = loadedAlgorithm ? `${loadedAlgorithm.slug}/steps.ts` : t("create.tools.currentDraft");
  const jsonPreview = useMemo(
    () => JSON.stringify({
      name: name.trim() || "Example Sort",
      slug: slug.trim() || "example-sort",
      category,
      description: description.trim() || "...",
    }, null, 2),
    [category, description, name, slug],
  );

  async function copyJson() {
    await navigator.clipboard.writeText(jsonPreview);
    setJsonCopied(true);
    window.setTimeout(() => setJsonCopied(false), 1400);
  }

  async function runLocalTest() {
    setIsRunningLocalTest(true);
    setLocalTestError(null);
    setLocalTestResult(null);

    const worker = new Worker(new URL("../workers/algorithmPreview.worker.ts", import.meta.url), {
      type: "module",
    });
    const startedAt = performance.now();
    const requestId = Date.now();

    try {
      const result = await new Promise<LocalTestResult>((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
          worker.terminate();
          reject(new Error(t("create.tools.localTest.timeout")));
        }, 1500);

        worker.onmessage = (event: MessageEvent<PreviewWorkerResult>) => {
          const payload = event.data;

          if (payload.id !== requestId) {
            return;
          }

          window.clearTimeout(timeoutId);
          worker.terminate();

          if (!payload.ok) {
            reject(new Error(payload.error));
            return;
          }

          resolve({
            durationMs: performance.now() - startedAt,
            stepCount: payload.steps.length,
          });
        };

        worker.postMessage({
          id: requestId,
          code: stripPreviewOnlyImports(testCode),
          input: sampleArray,
        });
      });

      setLocalTestResult(result);
    } catch (error) {
      setLocalTestError(error instanceof Error ? error.message : t("create.tools.localTest.failed"));
    } finally {
      setIsRunningLocalTest(false);
    }
  }

  function applyDataset(values: number[]) {
    onSampleArrayChange(values);
  }

  function setDatasetSizeAndRefresh(nextSize: "small" | "medium") {
    setDatasetSize(nextSize);
    const length = nextSize === "small" ? 12 : 32;
    applyDataset(randomArray(length));
  }

  return (
    <section className="mt-6 space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">{t("create.tools.eyebrow")}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{t("create.tools.title")}</h2>
      </div>

      <ToolsAccordionItem
        title={t("create.tools.jsonGenerator.title")}
        open={openTool === "json"}
        onToggle={() => setOpenTool((current) => (current === "json" ? null : "json"))}
      >
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium text-zinc-600 dark:text-zinc-300">{t("create.fields.name")}</span>
            <input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-950/10 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-zinc-900"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-zinc-600 dark:text-zinc-300">{t("create.fields.slug")}</span>
            <input
              value={slug}
              onChange={(event) => onSlugChange(event.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-950/10 bg-white px-3 py-2 font-mono outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-zinc-900"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-zinc-600 dark:text-zinc-300">{t("create.fields.category")}</span>
            <select
              value={category}
              onChange={(event) => onCategoryChange(event.target.value as AlgorithmCategory)}
              className="mt-2 w-full rounded-xl border border-zinc-950/10 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-zinc-900"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {t(`create.categories.${option}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm md:col-span-2">
            <span className="font-medium text-zinc-600 dark:text-zinc-300">{t("create.fields.description")}</span>
            <textarea
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-zinc-950/10 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-zinc-900"
            />
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("create.tools.jsonGenerator.description")}</p>
          <button
            type="button"
            onClick={() => void copyJson()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-950/10 px-3 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
          >
            <Copy size={15} />
            {jsonCopied ? t("create.tools.jsonGenerator.copied") : t("create.tools.jsonGenerator.copy")}
          </button>
        </div>
        <pre className="mt-4 overflow-auto rounded-xl bg-zinc-950 p-4 text-sm leading-6 text-teal-100">
          <code>{jsonPreview}</code>
        </pre>
      </ToolsAccordionItem>

      <ToolsAccordionItem
        title={t("create.tools.localTest.title")}
        open={openTool === "test"}
        onToggle={() => setOpenTool((current) => (current === "test" ? null : "test"))}
      >
        <div className="mt-4 space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("create.tools.localTest.note")}</p>
          <div className="rounded-xl border border-zinc-950/10 bg-zinc-950/5 p-4 text-sm leading-6 dark:border-white/10 dark:bg-white/5">
            <p className="font-semibold">{t("create.tools.localTest.testSource")}</p>
            <p className="mt-1 text-zinc-600 dark:text-zinc-300">{activeSourceLabel}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void onLoadExistingAlgorithm()}
              disabled={isLoadingAlgorithm}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-950/10 px-3 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
            >
              <FolderOpen size={15} />
              {isLoadingAlgorithm ? t("create.preview.loadingFolder") : t("create.tools.localTest.openFolder")}
            </button>
            <button
              type="button"
              onClick={() => void runLocalTest()}
              disabled={isRunningLocalTest}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-white dark:text-zinc-950"
            >
              {isRunningLocalTest ? t("create.tools.localTest.running") : t("create.tools.localTest.run")}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["small", "medium"] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setDatasetSizeAndRefresh(size)}
                className={`inline-flex rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  datasetSize === size
                    ? "bg-teal-600 text-white"
                    : "border border-zinc-950/10 bg-white text-zinc-700 hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-white dark:hover:text-zinc-950"
                }`}
              >
                {size === "small" ? t("create.tools.localTest.smallDataset") : t("create.tools.localTest.mediumDataset")}
              </button>
            ))}
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {t("create.tools.localTest.currentDatasetSize", { count: sampleArray.length })}
          </p>
          {localTestResult ? (
            <div className="rounded-xl border border-zinc-950/10 bg-zinc-950/5 p-4 text-sm leading-6 dark:border-white/10 dark:bg-white/5">
              <p className="font-semibold">{t("create.tools.localTest.resultMs", { duration: localTestResult.durationMs.toFixed(2) })}</p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-300">{t("create.tools.localTest.generatedSteps", { count: localTestResult.stepCount })}</p>
            </div>
          ) : null}
          {loadResult ? (
            <div
              className={`rounded-xl border p-4 text-sm leading-6 ${
                loadResult.kind === "success"
                  ? "border-emerald-500/20 bg-emerald-50 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100"
                  : "border-rose-500/20 bg-rose-50 text-rose-950 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100"
              }`}
            >
              <p className="font-semibold">{loadResult.title}</p>
              <p className="mt-1">{loadResult.body}</p>
            </div>
          ) : null}
          {localTestError ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-50 p-4 text-sm leading-6 text-rose-950 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100">
              {localTestError}
            </div>
          ) : null}
        </div>
      </ToolsAccordionItem>

      <ToolsAccordionItem
        title={t("create.tools.datasetGenerator.title")}
        open={openTool === "datasets"}
        onToggle={() => setOpenTool((current) => (current === "datasets" ? null : "datasets"))}
      >
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            {[
              { label: t("create.tools.datasetGenerator.random"), values: randomArray(datasetSize === "small" ? 12 : 32) },
              { label: t("create.tools.datasetGenerator.nearlySorted"), values: buildNearlySortedDataset(datasetSize === "small" ? 12 : 32) },
              { label: t("create.tools.datasetGenerator.reverseSorted"), values: buildReverseSortedDataset(datasetSize === "small" ? 12 : 32) },
              { label: t("create.tools.datasetGenerator.manyDuplicates"), values: buildManyDuplicatesDataset(datasetSize === "small" ? 12 : 32) },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => applyDataset(option.values)}
                className="inline-flex rounded-xl border border-zinc-950/10 px-3 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-zinc-950/10 bg-zinc-950/5 p-4 text-sm leading-6 dark:border-white/10 dark:bg-white/5">
            <p className="font-semibold">{t("create.tools.datasetGenerator.currentPreviewDataset")}</p>
            <code className="mt-2 block overflow-auto text-sm text-zinc-600 dark:text-zinc-300">{sampleArray.join(", ")}</code>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("create.tools.datasetGenerator.description")}</p>
        </div>
      </ToolsAccordionItem>
    </section>
  );
}

export function CreatePage({ dark, onToggleDark }: CreatePageProps) {
  const { t } = useTranslation();

  const toolItems = [
    {
      title: t("create.hub.tools.items.json.title"),
      description: t("create.hub.tools.items.json.description"),
    },
    {
      title: t("create.hub.tools.items.test.title"),
      description: t("create.hub.tools.items.test.description"),
    },
    {
      title: t("create.hub.tools.items.datasets.title"),
      description: t("create.hub.tools.items.datasets.description"),
    },
  ];

  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main className="px-5 py-8 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <a
            data-route
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:-translate-x-0.5 dark:border-white/10 dark:bg-white/10"
          >
            <ArrowLeft size={16} />
            {t("create.hub.back")}
          </a>
        </div>

        <section className="relative mt-8 overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(20,184,166,0.1),rgba(255,255,255,0.96)_34%,rgba(255,255,255,1)_100%)] px-6 py-16 dark:bg-[linear-gradient(180deg,rgba(20,184,166,0.14),rgba(9,9,11,0.94)_34%,rgba(9,9,11,1)_100%)] sm:px-10 sm:py-20">
          <div className="pointer-events-none absolute -left-28 -top-2 h-64 w-64 rounded-full bg-teal-400/14 blur-3xl dark:bg-teal-300/14" />
          <div className="pointer-events-none absolute -right-24 top-8 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-300/10" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-teal-100/55 to-transparent dark:from-teal-500/10" />
          <div className="pointer-events-none absolute left-12 top-12 grid grid-cols-4 gap-2 opacity-10">
            {Array.from({ length: 12 }).map((_, index) => (
              <span key={index} className="h-1.5 w-1.5 rounded-full bg-zinc-500 dark:bg-zinc-300" />
            ))}
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
              {t("create.hub.hero.eyebrow")}
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-7xl">
              {t("create.hub.hero.title")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-xl font-medium leading-8 text-zinc-700 dark:text-zinc-200 sm:text-2xl">
              {t("create.hub.hero.subtitle")}
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-600 dark:text-zinc-300 sm:text-lg">
              {t("create.hub.hero.description")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a
                  data-route
                  href="/contribute"
                  className="inline-flex items-center gap-2 rounded-2xl border border-zinc-950/10 bg-white/80 px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-zinc-50"
                >
                  <GitBranch size={16} />
                  {t("create.hub.hero.openWizard")}
                  <ArrowUpRight size={15} />
                </a>
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-950/10 bg-white/80 px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-zinc-50"
              >
                {t("create.hub.hero.clone")}
                <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-16 max-w-4xl space-y-16 sm:space-y-20">
          <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
            <div className="rounded-2xl border border-zinc-950/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/[0.03]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                {t("create.hub.wizard.eyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {t("create.hub.wizard.title")}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                {t("create.hub.wizard.description")}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  data-route
                  href="/contribute"
                  className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950"
                >
                  {t("create.hub.wizard.open")}
                  <ArrowUpRight size={16} />
                </a>
                <p className="self-center text-sm text-zinc-500 dark:text-zinc-400">{t("create.hub.wizard.note")}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-950/10 bg-zinc-950 px-5 py-6 text-white dark:border-white/10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                {t("create.hub.quickStart.eyebrow")}
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{t("create.hub.quickStart.title")}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{t("create.hub.quickStart.description")}</p>
            </div>
          </section>

          <section>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                {t("create.hub.tools.eyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {t("create.hub.tools.title")}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {t("create.hub.tools.description")}
              </p>
            </div>

            <div className="mx-auto mt-8 grid max-w-5xl gap-5 text-left md:grid-cols-2">
              {toolItems.map((item, index) => (
                <div
                  key={item.title}
                  className={index === toolItems.length - 1
                    ? "md:col-span-2 md:flex md:justify-center"
                    : undefined}
                >
                  <div className="min-h-44 w-full max-w-[30rem] rounded-2xl border border-zinc-950/10 bg-white/70 px-6 py-6 dark:border-white/10 dark:bg-white/[0.03]">
                    <WandSparkles className="h-6 w-6 text-teal-600 dark:text-teal-300" />
                    <p className="mt-5 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">{item.title}</p>
                    <p className="mt-3 max-w-md text-sm leading-7 text-zinc-600 dark:text-zinc-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <a
                href="/create/tools"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950"
              >
                {t("create.hub.tools.open")}
                <ArrowUpRight className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={16} />
              </a>
            </div>
          </section>

          <section className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              {t("create.hub.preview.eyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              {t("create.hub.preview.title")}
            </h2>

            <div className="mx-auto mt-8 grid max-w-5xl gap-5 text-left md:grid-cols-2">
              <div className="min-h-44 rounded-2xl border border-zinc-950/10 bg-white/70 px-6 py-6 dark:border-white/10 dark:bg-white/[0.03]">
                <FolderOpen className="h-6 w-6 text-teal-600 dark:text-teal-300" />
                <p className="mt-5 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                  {t("create.hub.preview.liveTitle")}
                </p>
                <p className="mt-3 max-w-md text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {t("create.hub.preview.liveNote")}
                </p>
              </div>

              <div className="min-h-44 rounded-2xl border border-zinc-950/10 bg-white/70 px-6 py-6 dark:border-white/10 dark:bg-white/[0.03]">
                <FolderOpen className="h-6 w-6 text-teal-600 dark:text-teal-300" />
                <p className="mt-5 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                  {t("create.hub.preview.loadTitle")}
                </p>
                <p className="mt-3 max-w-md text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {t("create.hub.preview.loadNote")}
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <a
                data-route
                href="/create/preview"
                className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-500"
              >
                {t("create.hub.preview.open")}
                <ArrowUpRight size={16} />
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </Shell>
  );
}
