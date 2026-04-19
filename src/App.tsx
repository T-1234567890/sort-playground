import { useEffect, useMemo, useState } from "react";
import { algorithms } from "./core/algorithms";
import { AlgorithmPage } from "./pages/AlgorithmPage";
import { AboutPage } from "./pages/AboutPage";
import { AllAlgorithmsPage } from "./pages/AllAlgorithmsPage";
import { ContributePage } from "./pages/ContributePage";
import { ComparePage } from "./pages/ComparePage";
import { EmbedPage } from "./pages/EmbedPage";
import { HomePage } from "./pages/HomePage";
import { BenchmarkDetailPage } from "./pages/BenchmarkDetailPage";
import { BenchmarkLandingPage } from "./pages/BenchmarkLandingPage";
import { LanguageBenchmarkDetailPage } from "./pages/LanguageBenchmarkDetailPage";
import { LanguageBenchmarkPage } from "./pages/LanguageBenchmarkPage";
import { LegalPage } from "./pages/LegalPage";
import { LabsPage } from "./pages/LabsPage";
import { RacePage } from "./pages/RacePage";

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

  if (path === "/compare") {
    return { name: null, page: "compare" };
  }

  if (path === "/benchmark") {
    return { name: null, page: "benchmark" };
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

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [dark, setDark] = useState(() => {
    const theme = new URLSearchParams(window.location.search).get("theme");

    if (theme === "dark") {
      return true;
    }

    if (theme === "light") {
      return false;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

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

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
      {selectedAlgorithm && route.page === "embed" ? (
        <EmbedPage algorithm={selectedAlgorithm} />
      ) : route.page === "language-benchmark-detail" ? (
        <LanguageBenchmarkDetailPage slug={route.name ?? ""} dark={dark} onToggleDark={() => setDark((value) => !value)} />
      ) : route.page === "language-benchmark" ? (
        <LanguageBenchmarkPage dark={dark} onToggleDark={() => setDark((value) => !value)} />
      ) : route.page === "benchmark-detail" ? (
        <BenchmarkDetailPage slug={route.name ?? ""} dark={dark} onToggleDark={() => setDark((value) => !value)} />
      ) : selectedAlgorithm ? (
        <AlgorithmPage algorithm={selectedAlgorithm} dark={dark} onToggleDark={() => setDark((value) => !value)} />
      ) : route.page === "allalgo" ? (
        <AllAlgorithmsPage algorithms={algorithms} dark={dark} onToggleDark={() => setDark((value) => !value)} />
      ) : route.page === "about" ? (
        <AboutPage dark={dark} onToggleDark={() => setDark((value) => !value)} />
      ) : route.page === "contribute" ? (
        <ContributePage dark={dark} onToggleDark={() => setDark((value) => !value)} />
      ) : route.page === "compare" ? (
        <ComparePage algorithms={algorithms} dark={dark} onToggleDark={() => setDark((value) => !value)} />
      ) : route.page === "benchmark" ? (
        <BenchmarkLandingPage dark={dark} onToggleDark={() => setDark((value) => !value)} />
      ) : route.page === "race" ? (
        <RacePage algorithms={algorithms} dark={dark} onToggleDark={() => setDark((value) => !value)} />
      ) : route.page === "labs" ? (
        <LabsPage dark={dark} onToggleDark={() => setDark((value) => !value)} />
      ) : route.page === "privacy" || route.page === "terms" ? (
        <LegalPage type={route.page} dark={dark} onToggleDark={() => setDark((value) => !value)} />
      ) : (
        <HomePage algorithms={algorithms} dark={dark} onToggleDark={() => setDark((value) => !value)} />
      )}
    </div>
  );
}
