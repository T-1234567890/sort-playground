import type { Algorithm, AlgorithmMeta } from "./types";
import { quickSortSteps } from "../algorithms/quick-sort/steps";
import { mergeSortSteps } from "../algorithms/merge-sort/steps";
import { stalinSortSteps } from "../algorithms/stalin-sort/steps";
import { bogoSortSteps } from "../algorithms/bogo-sort/steps";
import { sleepSortSteps } from "../algorithms/sleep-sort/steps";
import { bubbleSortSteps } from "../algorithms/bubble-sort/steps";
import { insertionSortSteps } from "../algorithms/insertion-sort/steps";
import { gnomeSortSteps } from "../algorithms/gnome-sort/steps";
import { stoogeSortSteps } from "../algorithms/stooge-sort/steps";
import { bozoSortSteps } from "../algorithms/bozo-sort/steps";
import { slowsortSteps } from "../algorithms/slowsort/steps";
import { miracleSortSteps } from "../algorithms/miracle-sort/steps";
import { beadSortSteps } from "../algorithms/bead-sort/steps";
import { manualSortSteps } from "../algorithms/manual-sort/steps";

const metaModules = import.meta.glob<AlgorithmMeta>("../algorithms/*/meta.json", {
  eager: true,
  import: "default",
});

const pythonModules = import.meta.glob<string>("../algorithms/*/python.py", {
  eager: true,
  query: "?raw",
  import: "default",
});

const rustModules = import.meta.glob<string>("../algorithms/*/rust.rs", {
  eager: true,
  query: "?raw",
  import: "default",
});

const cModules = import.meta.glob<string>("../algorithms/*/c.c", {
  eager: true,
  query: "?raw",
  import: "default",
});

const stepModules = {
  "quick-sort": quickSortSteps,
  "merge-sort": mergeSortSteps,
  "stalin-sort": stalinSortSteps,
  "bogo-sort": bogoSortSteps,
  "sleep-sort": sleepSortSteps,
  "bubble-sort": bubbleSortSteps,
  "insertion-sort": insertionSortSteps,
  "gnome-sort": gnomeSortSteps,
  "stooge-sort": stoogeSortSteps,
  "bozo-sort": bozoSortSteps,
  slowsort: slowsortSteps,
  "miracle-sort": miracleSortSteps,
  "bead-sort": beadSortSteps,
  "manual-sort": manualSortSteps,
};

function slugFromPath(path: string) {
  return path.split("/").at(-2) ?? "";
}

function rawFor(modules: Record<string, string>, slug: string, file: string) {
  return modules[`../algorithms/${slug}/${file}`] ?? "";
}

export const algorithms: Algorithm[] = Object.entries(metaModules)
  .flatMap(([path, meta]) => {
    const slug = slugFromPath(path);
    const steps = stepModules[slug as keyof typeof stepModules];

    if (!steps) {
      return [];
    }

    return [{
      ...meta,
      spaceComplexity: meta.spaceComplexity ?? meta.space,
      slug,
      steps,
      code: {
        python: rawFor(pythonModules, slug, "python.py"),
        rust: rawFor(rustModules, slug, "rust.rs"),
        c: rawFor(cModules, slug, "c.c"),
      },
    }];
  })
  .sort((a, b) => {
    const order = ["classic", "weird", "meme"];
    return order.indexOf(a.category) - order.indexOf(b.category) || a.name.localeCompare(b.name);
  });
