import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlgorithmExplorer } from "../components/AlgorithmExplorer";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import type { Algorithm } from "../core/types";

type AllAlgorithmsPageProps = {
  algorithms: Algorithm[];
  dark: boolean;
  onToggleDark: () => void;
};

export function AllAlgorithmsPage({ algorithms, dark, onToggleDark }: AllAlgorithmsPageProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"browse" | "compare" | "race">("browse");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  function setPickerMode(nextMode: "browse" | "compare" | "race") {
    setMode(nextMode);
    setSelectedSlugs([]);
  }

  function toggleSelection(slug: string) {
    setSelectedSlugs((current) => {
      if (current.includes(slug)) {
        return current.filter((item) => item !== slug);
      }

      const limit = mode === "race" ? 8 : 2;
      return current.length < limit ? [...current, slug] : current;
    });
  }

  const requiredSelections = mode === "race" ? selectedSlugs.length >= 2 : selectedSlugs.length === 2;
  const actionHref = mode === "compare"
    ? `/compare?left=${selectedSlugs[0] ?? ""}&right=${selectedSlugs[1] ?? ""}`
    : `/race?algorithms=${selectedSlugs.join(",")}`;

  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <a
          data-route
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:-translate-x-0.5 dark:border-white/10 dark:bg-white/10"
        >
          <ArrowLeft size={16} />
          {t("algorithm.back")}
        </a>

        <section className="mt-10">
          <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">{t("allAlgorithms.eyebrow")}</p>
          <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-5xl font-semibold tracking-tight">{t("allAlgorithms.title")}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
                {t("allAlgorithms.description")}
              </p>
            </div>
            <p className="font-mono text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              {t("allAlgorithms.count", { count: algorithms.length })}
            </p>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 rounded-lg border border-zinc-950/10 bg-white/72 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("allAlgorithms.toolsTitle")}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {mode === "browse"
                    ? t("allAlgorithms.toolsDescription")
                    : mode === "race"
                      ? t("allAlgorithms.raceSelectionHint")
                      : t("allAlgorithms.selectionHint")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPickerMode("browse")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    mode === "browse" ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "bg-zinc-950/5 text-zinc-600 hover:bg-zinc-950/10 dark:bg-white/10 dark:text-zinc-300"
                  }`}
                >
                  {t("allAlgorithms.browse")}
                </button>
                <button
                  type="button"
                  onClick={() => setPickerMode("compare")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    mode === "compare" ? "bg-teal-500 text-zinc-950" : "bg-zinc-950/5 text-zinc-600 hover:bg-zinc-950/10 dark:bg-white/10 dark:text-zinc-300"
                  }`}
                >
                  {t("allAlgorithms.compare")}
                </button>
                <button
                  type="button"
                  onClick={() => setPickerMode("race")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    mode === "race" ? "bg-teal-500 text-zinc-950" : "bg-zinc-950/5 text-zinc-600 hover:bg-zinc-950/10 dark:bg-white/10 dark:text-zinc-300"
                  }`}
                >
                  {t("allAlgorithms.race")}
                </button>
              </div>
            </div>
            {mode !== "browse" ? (
              <div className="mt-4 flex flex-col justify-between gap-3 border-t border-zinc-950/10 pt-4 dark:border-white/10 sm:flex-row sm:items-center">
                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                  {t(mode === "race" ? "allAlgorithms.raceSelected" : "allAlgorithms.selected", { count: selectedSlugs.length })}
                </p>
                <a
                  data-route={requiredSelections ? true : undefined}
                  href={requiredSelections ? actionHref : "#"}
                  aria-disabled={!requiredSelections}
                  className={`inline-flex justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    requiredSelections
                      ? "bg-zinc-950 text-white hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950"
                      : "pointer-events-none bg-zinc-950/10 text-zinc-400 dark:bg-white/10"
                  }`}
                >
                  {mode === "compare" ? t("allAlgorithms.startCompare") : t("allAlgorithms.startRace")}
                </a>
              </div>
            ) : null}
          </div>
          <AlgorithmExplorer
            algorithms={algorithms}
            pageSize={18}
            selectionMode={mode === "browse" ? undefined : mode}
            selectedSlugs={selectedSlugs}
            onToggleSelection={toggleSelection}
            maxSelections={mode === "race" ? 8 : 2}
          />
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
