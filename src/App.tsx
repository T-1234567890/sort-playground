import { useEffect, useMemo, useState } from "react";
import { algorithms } from "./core/algorithms";
import { SettingsProvider, useSettings } from "./hooks/useSettings";
import { AlgorithmPage } from "./pages/AlgorithmPage";
import { AboutPage } from "./pages/AboutPage";
import { AllAlgorithmsPage } from "./pages/AllAlgorithmsPage";
import { ContributePage } from "./pages/ContributePage";
import { ComparePage } from "./pages/ComparePage";
import { EmbedPage } from "./pages/EmbedPage";
import { HomePage } from "./pages/HomePage";
import { BenchmarkDetailPage } from "./pages/BenchmarkDetailPage";
import { BenchmarkComparePage } from "./pages/BenchmarkComparePage";
import { BenchmarkLandingPage } from "./pages/BenchmarkLandingPage";
import { BenchmarkScalePage } from "./pages/BenchmarkScalePage";
import { LanguageBenchmarkComparePage } from "./pages/LanguageBenchmarkComparePage";
import { LanguageBenchmarkDetailPage } from "./pages/LanguageBenchmarkDetailPage";
import { LanguageBenchmarkPage } from "./pages/LanguageBenchmarkPage";
import { LegalPage } from "./pages/LegalPage";
import { LabsPage } from "./pages/LabsPage";
import { RacePage } from "./pages/RacePage";
import { CreatePage } from "./pages/CreatePage";
import { CreatePreviewPage } from "./pages/CreatePreviewPage";
import { CreateToolsPage } from "./pages/CreateToolsPage";
import { SettingsPage } from "./pages/SettingsPage";

function getRoute() {
  const path = window.location.pathname;

  if (path === "/about") {
    return { name: null, page: "about" };
  }

  if (path === "/allalgo") {
    return { name: null, page: "allalgo" };
  }

  if (path === "/contribute") {
    return { name: null, page: "contribute" };
  }

  if (path === "/create") {
    return { name: null, page: "create" };
  }

  if (path === "/create/tools") {
    return { name: null, page: "create-tools" };
  }

  if (path === "/create/preview") {
    return { name: null, page: "create-preview" };
  }

  if (path === "/settings") {
    return { name: null, page: "settings" };
  }

  if (path === "/compare") {
    return { name: null, page: "compare" };
  }

  if (path === "/benchmark") {
    return { name: null, page: "benchmark" };
  }

  if (path === "/benchmark/scale") {
    return { name: null, page: "benchmark-scale" };
  }

  if (path === "/labs/benchmark/languages/compare") {
    return { name: null, page: "language-benchmark-compare" };
  }

  if (path === "/labs/benchmark/compare") {
    return { name: null, page: "benchmark-compare" };
  }

  if (path === "/race") {
    return { name: null, page: "race" };
  }

  if (path.startsWith("/labs/benchmark/languages/")) {
    return { name: decodeURIComponent(path.replace("/labs/benchmark/languages/", "")), page: "language-benchmark-detail" };
  }

  if (path === "/labs/benchmark/languages") {
    return { name: null, page: "language-benchmark" };
  }

  if (path.startsWith("/labs/benchmark/")) {
    return { name: decodeURIComponent(path.replace("/labs/benchmark/", "")), page: "benchmark-detail" };
  }

  if (path === "/labs" || path.startsWith("/labs/")) {
    return { name: null, page: "labs" };
  }

  if (path === "/privacy") {
    return { name: null, page: "privacy" };
  }

  if (path === "/terms") {
    return { name: null, page: "terms" };
  }

  if (path.startsWith("/algo/")) {
    return { name: decodeURIComponent(path.replace("/algo/", "")), page: "algorithm" };
  }

  if (path.startsWith("/embed/algo/")) {
    return { name: decodeURIComponent(path.replace("/embed/algo/", "")), page: "embed" };
  }

  return { name: null, page: "home" };
}

function AppContent() {
  const [route, setRoute] = useState(getRoute);
  const { settings, updateSetting } = useSettings();
  const [systemDark, setSystemDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const themeOverride = new URLSearchParams(window.location.search).get("theme");
  const dark = themeOverride === "dark"
    ? true
    : themeOverride === "light"
      ? false
      : settings.theme === "system"
        ? systemDark
        : settings.theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);

    setSystemDark(mediaQuery.matches);
    mediaQuery.addEventListener("change", onChange);

    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[data-route]") as HTMLAnchorElement | null;

      if (!anchor || anchor.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();
      window.history.pushState({}, "", `${anchor.pathname}${anchor.search}`);
      setRoute(getRoute());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onPopState = () => setRoute(getRoute());

    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const selectedAlgorithm = useMemo(
    () => algorithms.find((algorithm) => algorithm.slug === route.name),
    [route.name],
  );
  const toggleTheme = () => updateSetting("theme", dark ? "light" : "dark");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
      {selectedAlgorithm && route.page === "embed" ? (
        <EmbedPage algorithm={selectedAlgorithm} />
      ) : route.page === "language-benchmark-compare" ? (
        <LanguageBenchmarkComparePage dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "language-benchmark-detail" ? (
        <LanguageBenchmarkDetailPage slug={route.name ?? ""} dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "language-benchmark" ? (
        <LanguageBenchmarkPage dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "benchmark-compare" ? (
        <BenchmarkComparePage dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "benchmark-detail" ? (
        <BenchmarkDetailPage slug={route.name ?? ""} dark={dark} onToggleDark={toggleTheme} />
      ) : selectedAlgorithm ? (
        <AlgorithmPage algorithm={selectedAlgorithm} dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "allalgo" ? (
        <AllAlgorithmsPage algorithms={algorithms} dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "about" ? (
        <AboutPage dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "contribute" ? (
        <ContributePage dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "create" ? (
        <CreatePage dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "create-tools" ? (
        <CreateToolsPage dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "create-preview" ? (
        <CreatePreviewPage dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "settings" ? (
        <SettingsPage dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "compare" ? (
        <ComparePage algorithms={algorithms} dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "benchmark" ? (
        <BenchmarkLandingPage dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "benchmark-scale" ? (
        <BenchmarkScalePage dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "race" ? (
        <RacePage algorithms={algorithms} dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "labs" ? (
        <LabsPage dark={dark} onToggleDark={toggleTheme} />
      ) : route.page === "privacy" || route.page === "terms" ? (
        <LegalPage type={route.page} dark={dark} onToggleDark={toggleTheme} />
      ) : (
        <HomePage algorithms={algorithms} dark={dark} onToggleDark={toggleTheme} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
