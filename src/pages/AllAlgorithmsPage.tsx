import { ArrowLeft } from "lucide-react";
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
          <AlgorithmExplorer algorithms={algorithms} pageSize={18} />
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
