import { ArrowLeft } from "lucide-react";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";
import { useSettings, type Settings } from "../hooks/useSettings";
import { useTranslation } from "react-i18next";

type SettingsPageProps = {
  dark: boolean;
  onToggleDark: () => void;
};

type SettingOption<T extends string> = {
  value: T;
  label: string;
  description: string;
};

function SettingsOptionGroup<T extends keyof Settings>({
  title,
  description,
  value,
  options,
  onChange,
}: {
  title: string;
  description: string;
  value: Settings[T];
  options: SettingOption<Settings[T]>[];
  onChange: (value: Settings[T]) => void;
}) {
  return (
    <section className="border-t border-zinc-950/10 py-8 first:border-t-0 first:pt-0 dark:border-white/10">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {options.map((option) => {
          const active = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`min-w-[12rem] rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? "border-teal-500 bg-teal-500/10 text-zinc-950 dark:border-teal-300 dark:bg-teal-300/10 dark:text-zinc-50"
                  : "border-zinc-950/10 bg-white/75 hover:border-zinc-950/20 hover:bg-white dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/12"
              }`}
            >
              <p className="text-sm font-semibold">{option.label}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{option.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function SettingsPage({ dark, onToggleDark }: SettingsPageProps) {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettings();

  const scoreOptions: SettingOption<Settings["scoreDisplay"]>[] = [
    {
      value: "processed",
      label: t("settings.options.scoreDisplay.processed.label"),
      description: t("settings.options.scoreDisplay.processed.description"),
    },
    {
      value: "raw",
      label: t("settings.options.scoreDisplay.raw.label"),
      description: t("settings.options.scoreDisplay.raw.description"),
    },
  ];
  const themeOptions: SettingOption<Settings["theme"]>[] = [
    {
      value: "light",
      label: t("settings.options.theme.light.label"),
      description: t("settings.options.theme.light.description"),
    },
    {
      value: "dark",
      label: t("settings.options.theme.dark.label"),
      description: t("settings.options.theme.dark.description"),
    },
    {
      value: "system",
      label: t("settings.options.theme.system.label"),
      description: t("settings.options.theme.system.description"),
    },
  ];
  const datasetOptions: SettingOption<Settings["defaultDataset"]>[] = [
    {
      value: "random",
      label: t("settings.options.defaultDataset.random.label"),
      description: t("settings.options.defaultDataset.random.description"),
    },
    {
      value: "nearly-sorted",
      label: t("settings.options.defaultDataset.nearlySorted.label"),
      description: t("settings.options.defaultDataset.nearlySorted.description"),
    },
    {
      value: "reverse",
      label: t("settings.options.defaultDataset.reverse.label"),
      description: t("settings.options.defaultDataset.reverse.description"),
    },
  ];

  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <a
          data-route
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:-translate-x-0.5 dark:border-white/10 dark:bg-white/10"
        >
          <ArrowLeft size={16} />
          {t("settings.back")}
        </a>

        <section className="mt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">{t("settings.eyebrow")}</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight">{t("settings.title")}</h1>
          <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">{t("settings.description")}</p>
        </section>

        <section className="mt-10">
          <SettingsOptionGroup<"defaultDataset">
            title={t("settings.sections.general.title")}
            description={t("settings.sections.general.description")}
            value={settings.defaultDataset}
            options={datasetOptions}
            onChange={(value) => updateSetting("defaultDataset", value)}
          />
          <SettingsOptionGroup<"scoreDisplay">
            title={t("settings.sections.benchmark.title")}
            description={t("settings.sections.benchmark.description")}
            value={settings.scoreDisplay}
            options={scoreOptions}
            onChange={(value) => updateSetting("scoreDisplay", value)}
          />
          <SettingsOptionGroup<"theme">
            title={t("settings.sections.ui.title")}
            description={t("settings.sections.ui.description")}
            value={settings.theme}
            options={themeOptions}
            onChange={(value) => updateSetting("theme", value)}
          />
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
