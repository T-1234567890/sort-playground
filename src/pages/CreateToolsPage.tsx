import { ArrowLeft, WandSparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import {
  DRAFT_ALGORITHM_STORAGE_KEY,
  defaultDraftAlgorithmCode,
  DirectoryPickerWindow,
  loadAlgorithmFromDirectory,
  slugifyAlgorithmName,
  type LoadedAlgorithmDraft,
} from "../core/createAlgorithm";
import type { AlgorithmCategory } from "../core/types";
import { DEFAULT_ARRAY } from "../core/visualizer";
import { ToolsModeSection } from "./CreatePage";

type CreateToolsPageProps = {
  dark: boolean;
  onToggleDark: () => void;
};

export function CreateToolsPage({ dark, onToggleDark }: CreateToolsPageProps) {
  const { t } = useTranslation();
  const [loadedAlgorithm, setLoadedAlgorithm] = useState<LoadedAlgorithmDraft | null>(null);
  const [loadResult, setLoadResult] = useState<{ kind: "success" | "error"; title: string; body: string } | null>(null);
  const [isLoadingAlgorithm, setIsLoadingAlgorithm] = useState(false);
  const [code] = useState(() => {
    const draft = window.localStorage.getItem(DRAFT_ALGORITHM_STORAGE_KEY);
    return draft?.trim() ? draft : defaultDraftAlgorithmCode;
  });
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [category, setCategory] = useState<AlgorithmCategory>("classic");
  const [description, setDescription] = useState("");
  const [sampleArray, setSampleArray] = useState(DEFAULT_ARRAY);

  function updateName(nextName: string) {
    setName(nextName);

    if (!slugEdited) {
      setSlug(slugifyAlgorithmName(nextName));
    }
  }

  function updateSlug(nextSlug: string) {
    setSlugEdited(true);
    setSlug(nextSlug.toLowerCase());
  }

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
      setLoadResult({
        kind: "success",
        title: t("create.tools.page.algorithmFolderLoadedTitle"),
        body: t("create.tools.page.algorithmFolderLoadedBody", { slug: draft.slug }),
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
            {t("create.tools.page.back")}
          </a>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">{t("create.tools.page.eyebrow")}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{t("create.tools.page.title")}</h1>
              <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
                {t("create.tools.page.description")}
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-zinc-950/10 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/8">
              <WandSparkles className="mt-1 h-5 w-5 text-teal-600 dark:text-teal-300" />
              <div>
                <p className="font-semibold">{t("create.tools.page.helperTitle")}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {t("create.tools.page.helperBody")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <ToolsModeSection
          code={code}
          loadedAlgorithm={loadedAlgorithm}
          loadResult={loadResult}
          isLoadingAlgorithm={isLoadingAlgorithm}
          name={name}
          slug={slug}
          category={category}
          description={description}
          sampleArray={sampleArray}
          onNameChange={updateName}
          onSlugChange={updateSlug}
          onCategoryChange={setCategory}
          onDescriptionChange={setDescription}
          onSampleArrayChange={setSampleArray}
          onLoadExistingAlgorithm={loadExistingAlgorithm}
        />
      </main>
      <Footer />
    </Shell>
  );
}
