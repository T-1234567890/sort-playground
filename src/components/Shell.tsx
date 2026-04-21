import { Moon, Settings, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

type ShellProps = {
  children: ReactNode;
  dark: boolean;
  onToggleDark: () => void;
};

export function Shell({ children, dark, onToggleDark }: ShellProps) {
  const { i18n, t } = useTranslation();
  const isChinese = i18n.language.startsWith("zh");

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-zinc-950/10 bg-zinc-50/78 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a data-route href="/" className="text-base font-semibold tracking-tight">
            {t("nav.home")}
          </a>
          <div className="flex items-center gap-2">
            <a
              data-route
              href="/settings"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-950/10 bg-white/70 px-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
              aria-label={t("nav.settings")}
            >
              <Settings size={16} />
              <span className="ml-2 hidden sm:inline">{t("nav.settings")}</span>
            </a>
            <button
              type="button"
              onClick={() => void i18n.changeLanguage(isChinese ? "en" : "zh")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-950/10 bg-white/70 px-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
              aria-label={t("nav.language")}
            >
              {isChinese ? "EN" : "中文"}
            </button>
            <button
              type="button"
              onClick={onToggleDark}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-950/10 bg-white/70 text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
              aria-label={t("nav.toggleTheme")}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
