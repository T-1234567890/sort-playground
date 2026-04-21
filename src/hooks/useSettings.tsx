import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Settings = {
  scoreDisplay: "processed" | "raw";
  theme: "light" | "dark" | "system";
  defaultDataset: "random" | "nearly-sorted" | "reverse";
};

export const SETTINGS_STORAGE_KEY = "app-settings";

export const defaultSettings: Settings = {
  scoreDisplay: "processed",
  theme: "system",
  defaultDataset: "random",
};

type SettingsContextValue = {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  setSettings: (nextSettings: Settings) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function isSettings(value: unknown): value is Partial<Settings> {
  return typeof value === "object" && value !== null;
}

function mergeSettings(partial?: Partial<Settings>): Settings {
  return {
    scoreDisplay: partial?.scoreDisplay === "raw" ? "raw" : defaultSettings.scoreDisplay,
    theme: partial?.theme === "light" || partial?.theme === "dark" || partial?.theme === "system"
      ? partial.theme
      : defaultSettings.theme,
    defaultDataset: partial?.defaultDataset === "nearly-sorted" || partial?.defaultDataset === "reverse" || partial?.defaultDataset === "random"
      ? partial.defaultDataset
      : defaultSettings.defaultDataset,
  };
}

function loadStoredSettings() {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!stored) {
      return defaultSettings;
    }

    const parsed = JSON.parse(stored) as unknown;
    return mergeSettings(isSettings(parsed) ? parsed : undefined);
  } catch {
    return defaultSettings;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadStoredSettings);

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setSettings,
      updateSetting: (key, nextValue) => {
        setSettings((current) => ({ ...current, [key]: nextValue }));
      },
    }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }

  return context;
}
