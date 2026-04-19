import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { performance } from "node:perf_hooks";

const root = process.cwd();
const algorithmsDir = path.join(root, "src/algorithms");
const outputDir = path.join(root, "public/data");
const outputPath = path.join(outputDir, "benchmark-ranking.json");

function isSorted(array) {
  for (let index = 1; index < array.length; index += 1) {
    if (array[index - 1] > array[index]) {
      return false;
    }
  }

  return true;
}

function swap(array, left, right) {
  [array[left], array[right]] = [array[right], array[left]];
}

function quickSort(values) {
  const array = [...values];

  function sort(low, high) {
    if (low >= high) {
      return;
    }

    const pivot = array[high];
    let pointer = low;

    for (let index = low; index < high; index += 1) {
      if (array[index] <= pivot) {
        swap(array, pointer, index);
        pointer += 1;
      }
    }

    swap(array, pointer, high);
    sort(low, pointer - 1);
    sort(pointer + 1, high);
  }

  sort(0, array.length - 1);
  return array;
}

function mergeSort(values) {
  if (values.length <= 1) {
    return [...values];
  }

  const middle = Math.floor(values.length / 2);
  const left = mergeSort(values.slice(0, middle));
  const right = mergeSort(values.slice(middle));
  const merged = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] <= right[rightIndex]) {
      merged.push(left[leftIndex]);
      leftIndex += 1;
    } else {
      merged.push(right[rightIndex]);
      rightIndex += 1;
    }
  }

  return merged.concat(left.slice(leftIndex), right.slice(rightIndex));
}

function bubbleSort(values) {
  const array = [...values];

  for (let end = array.length - 1; end > 0; end -= 1) {
    for (let index = 0; index < end; index += 1) {
      if (array[index] > array[index + 1]) {
        swap(array, index, index + 1);
      }
    }
  }

  return array;
}

function insertionSort(values) {
  const array = [...values];

  for (let index = 1; index < array.length; index += 1) {
    const value = array[index];
    let pointer = index - 1;

    while (pointer >= 0 && array[pointer] > value) {
      array[pointer + 1] = array[pointer];
      pointer -= 1;
    }

    array[pointer + 1] = value;
  }

  return array;
}

function gnomeSort(values) {
  const array = [...values];
  let index = 1;

  while (index < array.length) {
    if (index === 0 || array[index] >= array[index - 1]) {
      index += 1;
    } else {
      swap(array, index, index - 1);
      index -= 1;
    }
  }

  return array;
}

function stoogeSort(values) {
  const array = [...values];

  function sort(left, right) {
    if (array[left] > array[right]) {
      swap(array, left, right);
    }

    const length = right - left + 1;

    if (length <= 2) {
      return;
    }

    const third = Math.floor(length / 3);
    sort(left, right - third);
    sort(left + third, right);
    sort(left, right - third);
  }

  sort(0, array.length - 1);
  return array;
}

function beadSort(values) {
  const positive = [...values];
  const max = Math.max(...positive, 0);
  const beads = positive.map((value) => Array.from({ length: max }, (_, index) => (index < value ? 1 : 0)));

  for (let column = 0; column < max; column += 1) {
    let sum = 0;

    for (let row = 0; row < beads.length; row += 1) {
      sum += beads[row][column];
      beads[row][column] = 0;
    }

    for (let row = beads.length - sum; row < beads.length; row += 1) {
      beads[row][column] = 1;
    }
  }

  return beads.map((row) => row.reduce((count, bead) => count + bead, 0));
}

const benchmarkImplementations = {
  "quick-sort": quickSort,
  "merge-sort": mergeSort,
  "bubble-sort": bubbleSort,
  "insertion-sort": insertionSort,
  "gnome-sort": gnomeSort,
  "stooge-sort": stoogeSort,
  "bead-sort": beadSort,
};

function createDataset(size, seed) {
  let state = seed;
  return Array.from({ length: size }, () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return (state % 200) + 1;
  });
}

const datasets = {
  small: createDataset(24, 7),
  medium: createDataset(120, 13),
  large: createDataset(240, 29),
};

async function loadAlgorithms() {
  const entries = await readdir(algorithmsDir, { withFileTypes: true });
  const algorithms = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const slug = entry.name;
    const metaPath = path.join(algorithmsDir, slug, "meta.json");
    const meta = JSON.parse(await readFile(metaPath, "utf8"));
    algorithms.push({ slug, ...meta });
  }

  return algorithms.sort((a, b) => a.name.localeCompare(b.name));
}

function inferBenchmarkDecision(algorithm) {
  if (algorithm.benchmarkMode === "none" || algorithm.benchmark === false || algorithm.special === "no-benchmark") {
    return {
      mode: "none",
      reason: algorithm.special || "benchmark=false",
      source: "algorithm-meta",
    };
  }

  if (algorithm.benchmarkMode === "estimated") {
    return {
      mode: "estimated",
      reason: "estimated-classic",
      source: "algorithm-meta",
    };
  }

  if (algorithm.benchmarkMode === "automated") {
    return {
      mode: "automated",
      reason: "automated-explicit",
      source: "algorithm-meta",
    };
  }

  const keywords = (algorithm.keywords ?? []).map((keyword) => String(keyword).toLowerCase());
  const text = [algorithm.name, algorithm.description, algorithm.complexity, ...keywords]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    algorithm.category === "meme" ||
    algorithm.category === "weird" ||
    algorithm.visualization === "custom" ||
    text.includes("random") ||
    text.includes("shuffle") ||
    text.includes("drag") ||
    text.includes("manual") ||
    text.includes("timing") ||
    text.includes("gravity") ||
    text.includes("depends on you") ||
    text.includes("undefined")
  ) {
    return {
      mode: "none",
      reason: "auto-excluded-unusual",
      source: "auto-scan",
    };
  }

  if (algorithm.category === "classic") {
    return {
      mode: "automated",
      reason: "auto-included-classic",
      source: "auto-scan",
    };
  }

  return {
    mode: "none",
    reason: "auto-excluded-unclassified",
    source: "auto-scan",
  };
}

function measure(fn, dataset) {
  const started = performance.now();
  const result = fn(dataset);
  const finished = performance.now();

  if (!isSorted(result)) {
    throw new Error("Benchmark result was not sorted.");
  }

  return Number((finished - started).toFixed(3));
}

async function main() {
  const algorithms = await loadAlgorithms();
  const ranking = [];

  for (const algorithm of algorithms) {
    const benchmarkDecision = inferBenchmarkDecision(algorithm);

    if (benchmarkDecision.mode === "none") {
      ranking.push({
        name: algorithm.name,
        slug: algorithm.slug,
        mode: "none",
        status: "exempt",
        reason: benchmarkDecision.reason,
        metadata: {
          source: benchmarkDecision.source,
          benchmarkMode: "none",
        },
        runs: [],
      });
      continue;
    }

    if (benchmarkDecision.mode === "estimated") {
      ranking.push({
        name: algorithm.name,
        slug: algorithm.slug,
        mode: "estimated",
        complexity: algorithm.complexity,
        relativeRank: algorithm.benchmarkRelativeRank || "medium",
        status: "estimated",
        metadata: {
          source: benchmarkDecision.source,
          benchmarkMode: "estimated",
        },
        runs: [],
      });
      continue;
    }

    const implementation = benchmarkImplementations[algorithm.slug];

    if (!implementation) {
      throw new Error(`Missing benchmark implementation for ${algorithm.slug}. Mark it as no-benchmark or add an implementation.`);
    }

    const runs = [];

    for (let runIndex = 0; runIndex < 3; runIndex += 1) {
      const samples = Object.values(datasets).map((dataset) => measure(implementation, dataset));
      const sampleAverage = samples.reduce((sum, value) => sum + value, 0) / samples.length;
      runs.push(Number(sampleAverage.toFixed(3)));
    }

    const datasetAverages = Object.fromEntries(
      Object.entries(datasets).map(([label, dataset]) => {
        const samples = Array.from({ length: 3 }, () => measure(implementation, dataset));
        const average = samples.reduce((sum, value) => sum + value, 0) / samples.length;
        return [label, Number(average.toFixed(3))];
      }),
    );

    const average = runs.reduce((sum, value) => sum + value, 0) / runs.length;

    ranking.push({
      name: algorithm.name,
      slug: algorithm.slug,
      mode: "automated",
      average: Number(average.toFixed(3)),
      unit: "ms",
      status: "benchmarked",
      metadata: {
        source: "github-actions",
        benchmarkMode: "automated",
      },
      runs,
      datasets: datasetAverages,
    });
  }

  ranking.sort((left, right) => {
    if (left.mode === "none" && right.mode !== "none") {
      return 1;
    }

    if (left.mode !== "none" && right.mode === "none") {
      return -1;
    }

    if (left.mode === "automated" && right.mode === "estimated") {
      return -1;
    }

    if (left.mode === "estimated" && right.mode === "automated") {
      return 1;
    }

    if (left.mode === "estimated" && right.mode === "estimated") {
      const rankOrder = { high: 0, medium: 1, low: 2 };
      return rankOrder[left.relativeRank || "medium"] - rankOrder[right.relativeRank || "medium"] || left.name.localeCompare(right.name);
    }

    return (left.average ?? Number.POSITIVE_INFINITY) - (right.average ?? Number.POSITIVE_INFINITY) || left.name.localeCompare(right.name);
  });

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(ranking, null, 2)}\n`);
  console.log(`Wrote ${ranking.length} benchmark entries.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
