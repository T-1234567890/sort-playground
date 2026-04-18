import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./i18n";
import "./styles.css";

const redirectedPath = new URLSearchParams(window.location.search).get("p");

if (redirectedPath) {
  window.history.replaceState({}, "", redirectedPath);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
