import { ArrowLeft, FolderOpen } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CreateAlgorithmPreview } from "../components/CreateAlgorithmPreview";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import {
  DirectoryPickerWindow,
  loadAlgorithmFromDirectory,
  REQUIRED_ALGORITHM_FILENAMES,
  type LoadedAlgorithmDraft,
} from "../core/createAlgorithm";
import { DEFAULT_ARRAY } from "../core/visualizer";

type CreatePreviewPageProps = {
  dark: boolean;
  onToggleDark: () => void;
};

type Notice = {
  kind: "success" | "error";
  title: string;
  body: string;
};

export function CreatePreviewPage({ dark, onToggleDark }: CreatePreviewPageProps) {
  const { t } = useTranslation();
  const [loadedAlgorithm, setLoadedAlgorithm] = useState<LoadedAlgorithmDraft | null>(null);
  const [loadResult, setLoadResult] = useState<Notice | null>(null);
  const [isLoadingAlgorithm, setIsLoadingAlgorithm] = useState(false);
  const [sampleArray, setSampleArray] = useState(DEFAULT_ARRAY);
  const [showFullSource, setShowFullSource] = useState(false);

  const truncatedSource = loadedAlgorithm
    ? loadedAlgorithm.files["steps.ts"].split("\n").slice(0, 14).join("\n")
    : "";

  async function loadExistingAlgorithm() {
    const pickerWindow = window as DirectoryPickerWindow;

    if (!pickerWindow.showDirectoryPicker || !window.isSecureContext) {
      setLoadResult({
        kind: "error",
        title: t("create.messages.folderAccessUnavailableTitle"),
        body: t("create.messages.folderAccessUnavailableBody"),
      });
      return;
    }

    setIsLoadingAlgorithm(true);

    try {
      const directoryHandle = await pickerWindow.showDirectoryPicker();
      const draft = await loadAlgorithmFromDirectory(directoryHandle);

      setLoadedAlgorithm(draft);
      setShowFullSource(false);
      setLoadResult({
        kind: "success",
        title: t("create.hub.preview.loadedTitle"),
        body: t("create.messages.loadedStructureBody", { slug: draft.slug }),
      });
    } catch (error) {
      setLoadedAlgorithm(null);
      setLoadResult({
        kind: "error",
        title: t("create.messages.couldNotLoadAlgorithmTitle"),
        body: error instanceof Error ? error.message : t("create.messages.invalidStructure"),
      });
    } finally {
      setIsLoadingAlgorithm(false);
    }
  }

  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <section>
          <a
            data-route
            href="/create"
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-950/10 bg-white/70 px-4 py-3 text-sm font-semibold transition hover:-translate-x-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15"
          >
            <ArrowLeft size={16} />
            {t("create.preview.page.back")}
          </a>

          <div className="mt-6 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">{t("create.preview.page.eyebrow")}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{t("create.preview.page.title")}</h1>
            <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
              {t("create.preview.page.description")}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-zinc-950/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">{t("create.hub.preview.panelEyebrow")}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{t("create.hub.preview.panelTitle")}</h2>
            </div>
            <button
              type="button"
              onClick={() => void loadExistingAlgorithm()}
              disabled={isLoadingAlgorithm}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FolderOpen size={16} />
              {isLoadingAlgorithm ? t("create.preview.loadingFolder") : t("create.preview.loadExisting")}
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {REQUIRED_ALGORITHM_FILENAMES.map((filename) => (
              <span
                key={filename}
                className="inline-flex rounded-full border border-zinc-950/10 bg-zinc-950/5 px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
              >
                {filename}
              </span>
            ))}
          </div>

          {loadResult ? (
            <div
              className={`mt-5 rounded-2xl border p-4 text-sm leading-6 ${
                loadResult.kind === "success"
                  ? "border-emerald-500/20 bg-emerald-50 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100"
                  : "border-rose-500/20 bg-rose-50 text-rose-950 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100"
              }`}
            >
              <p className="font-semibold">{loadResult.title}</p>
              <p className="mt-1">{loadResult.body}</p>
            </div>
          ) : null}
        </section>

        {loadedAlgorithm ? (
          <>
            <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_320px]">
              <CreateAlgorithmPreview
                code={loadedAlgorithm.files["steps.ts"]}
                eyebrow={t("create.preview.loadedEyebrow")}
                title={t("create.preview.loadedTitle", { name: loadedAlgorithm.metadata.name })}
                description={t("create.hub.preview.loadedDescription")}
                initialSampleArray={sampleArray}
                onSampleArrayChange={setSampleArray}
              />

              <aside className="rounded-2xl border border-zinc-950/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">{t("create.preview.loadedMetadata")}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{loadedAlgorithm.metadata.name}</h2>

                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-zinc-500 dark:text-zinc-400">{t("create.fields.slug")}</dt>
                    <dd className="font-mono font-semibold">{loadedAlgorithm.slug}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-zinc-500 dark:text-zinc-400">{t("create.fields.category")}</dt>
                    <dd className="font-semibold">{t(`create.categories.${loadedAlgorithm.metadata.category}`)}</dd>
                  </div>
                </dl>

                <p className="mt-5 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {loadedAlgorithm.metadata.description}
                </p>

                <div className="mt-5 border-t border-zinc-950/10 pt-5 dark:border-white/10">
                  <p className="font-semibold">{t("create.preview.languageFiles")}</p>
                  <div className="mt-3 space-y-3">
                    {(["python.py", "rust.rs", "c.c"] as const).map((filename) => (
                      <div key={filename} className="rounded-xl border border-zinc-950/10 bg-zinc-950/5 p-3 dark:border-white/10 dark:bg-white/5">
                        <p className="font-mono text-sm font-semibold">{filename}</p>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                          {loadedAlgorithm.files[filename].trim() ? t("create.preview.loadedSuccessfully") : t("create.preview.missingContent")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </section>

            <section className="mt-6 rounded-2xl border border-zinc-950/10 bg-white/70 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between gap-3 border-b border-zinc-950/10 px-5 py-4 dark:border-white/10">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">steps.ts</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">{t("create.preview.loadedSource")}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFullSource((current) => !current)}
                  className="inline-flex rounded-xl border border-zinc-950/10 px-3 py-2 text-sm font-semibold transition hover:bg-zinc-950 hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-zinc-950"
                >
                  {showFullSource ? t("create.preview.showLess") : t("create.preview.showFullCode")}
                </button>
              </div>
              <pre className="max-h-[42rem] overflow-auto px-5 py-4 text-sm leading-7 text-zinc-800 dark:text-zinc-100">
                <code>{showFullSource ? loadedAlgorithm.files["steps.ts"] : `${truncatedSource}${loadedAlgorithm.files["steps.ts"].includes("\n") ? "\n..." : ""}`}</code>
              </pre>
            </section>
          </>
        ) : (
          <section className="mt-6 rounded-2xl border border-dashed border-zinc-950/15 px-6 py-10 text-center dark:border-white/15">
            <p className="text-lg font-semibold tracking-tight">{t("create.hub.preview.emptyTitle")}</p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {t("create.hub.preview.emptyBody")}
            </p>
          </section>
        )}
      </main>
      <Footer />
    </Shell>
  );
}
