import { useEffect, useMemo, useState } from "react";
import { algorithms } from "./core/algorithms";
import { AlgorithmPage } from "./pages/AlgorithmPage";
import { AboutPage } from "./pages/AboutPage";
import { AllAlgorithmsPage } from "./pages/AllAlgorithmsPage";
import { EmbedPage } from "./pages/EmbedPage";
import { HomePage } from "./pages/HomePage";
import { LegalPage } from "./pages/LegalPage";

function getRoute() {
  const path = window.location.pathname;

  if (path === "/about") {
    return { name: null, page: "about" };
  }

  if (path === "/allalgo") {
    return { name: null, page: "allalgo" };
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
      window.history.pushState({}, "", anchor.pathname);
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
      ) : selectedAlgorithm ? (
        <AlgorithmPage algorithm={selectedAlgorithm} dark={dark} onToggleDark={() => setDark((value) => !value)} />
      ) : route.page === "allalgo" ? (
        <AllAlgorithmsPage algorithms={algorithms} dark={dark} onToggleDark={() => setDark((value) => !value)} />
      ) : route.page === "about" ? (
        <AboutPage dark={dark} onToggleDark={() => setDark((value) => !value)} />
      ) : route.page === "privacy" || route.page === "terms" ? (
        <LegalPage type={route.page} dark={dark} onToggleDark={() => setDark((value) => !value)} />
      ) : (
        <HomePage algorithms={algorithms} dark={dark} onToggleDark={() => setDark((value) => !value)} />
      )}
    </div>
  );
}
