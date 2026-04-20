import type { Algorithm, AlgorithmMeta, CommunityCodeExample, CommunityCodeExampleMeta } from "./types";
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
import { bitonicSortSteps } from "../algorithms/bitonic-sort/steps";
import { oddEvenMergeSortSteps } from "../algorithms/odd-even-merge-sort/steps";
import { cycleSortSteps } from "../algorithms/cycle-sort/steps";
import { librarySortSteps } from "../algorithms/library-sort/steps";
import { smoothsortSteps } from "../algorithms/smoothsort/steps";
import { quantumBogosortSteps } from "../algorithms/quantum-bogosort/steps";
import { thanosSortSteps } from "../algorithms/thanos-sort/steps";
import { heapSortSteps } from "../algorithms/heap-sort/steps";
import { shellSortSteps } from "../algorithms/shell-sort/steps";
import { countingSortSteps } from "../algorithms/counting-sort/steps";
import { radixSortSteps } from "../algorithms/radix-sort/steps";
import { introSortSteps } from "../algorithms/intro-sort/steps";

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

const communityExampleMetaModules = import.meta.glob<CommunityCodeExampleMeta[]>("../algorithms/*/community-examples.json", {
  eager: true,
  import: "default",
});

const directCommunityCodeModules = {
  ...import.meta.glob<string>("../algorithms/*/*.js", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../algorithms/*/*.ts", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../algorithms/*/*.go", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../algorithms/*/*.java", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../algorithms/*/*.cpp", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../algorithms/*/*.swift", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../algorithms/*/*.kt", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../algorithms/*/*.zig", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../algorithms/*/*.rb", { eager: true, query: "?raw", import: "default" }),
};

const legacyCommunityCodeModules = {
  ...import.meta.glob<string>("../algorithms/*/community/*.js", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../algorithms/*/community/*.ts", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../algorithms/*/community/*.go", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../algorithms/*/community/*.java", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../algorithms/*/community/*.cpp", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../algorithms/*/community/*.swift", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../algorithms/*/community/*.kt", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../algorithms/*/community/*.zig", { eager: true, query: "?raw", import: "default" }),
  ...import.meta.glob<string>("../algorithms/*/community/*.rb", { eager: true, query: "?raw", import: "default" }),
};

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
  "bitonic-sort": bitonicSortSteps,
  "odd-even-merge-sort": oddEvenMergeSortSteps,
  "cycle-sort": cycleSortSteps,
  "library-sort": librarySortSteps,
  smoothsort: smoothsortSteps,
  "quantum-bogosort": quantumBogosortSteps,
  "thanos-sort": thanosSortSteps,
  "heap-sort": heapSortSteps,
  "shell-sort": shellSortSteps,
  "counting-sort": countingSortSteps,
  "radix-sort": radixSortSteps,
  "intro-sort": introSortSteps,
};

function slugFromPath(path: string) {
  return path.split("/").at(-2) ?? "";
}

function rawFor(modules: Record<string, string>, slug: string, file: string) {
  return modules[`../algorithms/${slug}/${file}`] ?? "";
}

const reservedFilenames = new Set(["meta.json", "steps.ts", "python.py", "rust.rs", "c.c"]);
const languageCodeLabels: Record<string, string> = {
  js: "JavaScript",
  ts: "TypeScript",
  go: "Go",
  java: "Java",
  cpp: "C++",
  swift: "Swift",
  kt: "Kotlin",
  zig: "Zig",
  rb: "Ruby",
};

function directCommunityExamplesFor(slug: string): CommunityCodeExample[] {
  return Object.entries(directCommunityCodeModules)
    .flatMap(([modulePath, code]) => {
      if (!modulePath.startsWith(`../algorithms/${slug}/`)) {
        return [];
      }

      const file = modulePath.split("/").at(-1) ?? "";

      if (reservedFilenames.has(file)) {
        return [];
      }

      const [stem = "", extension = ""] = file.split(".");

      if (!stem || !extension || stem !== extension) {
        return [];
      }

      return [{
        id: `${stem}-community`,
        language: languageCodeLabels[stem] ?? stem.toUpperCase(),
        file,
        label: languageCodeLabels[stem] ?? stem.toUpperCase(),
        code,
      }];
    })
    .sort((left, right) => left.language.localeCompare(right.language));
}

function communityExamplesFor(slug: string): CommunityCodeExample[] {
  const directExamples = directCommunityExamplesFor(slug);

  if (directExamples.length > 0) {
    return directExamples;
  }

  const meta = communityExampleMetaModules[`../algorithms/${slug}/community-examples.json`] ?? [];

  return meta.flatMap((example) => {
    const code = legacyCommunityCodeModules[`../algorithms/${slug}/community/${example.file}`];

    if (!code) {
      return [];
    }

    return [{
      ...example,
      code,
    }];
  });
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
      communityExamples: communityExamplesFor(slug),
    }];
  })
  .sort((a, b) => {
    const order = ["classic", "weird", "meme"];
    return order.indexOf(a.category) - order.indexOf(b.category) || a.name.localeCompare(b.name);
  });
