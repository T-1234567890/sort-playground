import { writeFile } from "node:fs/promises";
import path from "node:path";

export const benchmarkLanguages = ["python", "rust", "c"];
export const benchmarkSizes = ["small", "medium", "large"];
export const benchmarkReferenceTimesMs = {
  small: 0.1,
  medium: 1,
  large: 5,
};
export const benchmarkProfiles = [
  "random-uniform",
  "nearly-sorted",
  "reverse-sorted",
  "many-duplicates",
  "low-value-range",
  "adversarial-pivot",
];

export const benchmarkProfileWeights = {
  "random-uniform": 1,
  "nearly-sorted": 1,
  "reverse-sorted": 1,
  "many-duplicates": 1,
  "low-value-range": 1,
  "adversarial-pivot": 1,
};

export const datasetSizes = {
  small: 100,
  medium: 1000,
  large: 10000,
};

const MAX_DATASET_VALUE = 1024;

function createRng(seed) {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function randomInt(rng, maxExclusive) {
  return Math.floor(rng() * maxExclusive);
}

function createRandomDataset(size, seed, maxValue = MAX_DATASET_VALUE) {
  const rng = createRng(seed);
  return Array.from({ length: size }, () => randomInt(rng, maxValue) + 1);
}

function createNearlySortedDataset(size, seed) {
  const rng = createRng(seed);
  const values = Array.from({ length: size }, (_, index) => index + 1);
  const swapCount = Math.max(1, Math.floor(size * 0.05));

  for (let index = 0; index < swapCount; index += 1) {
    const left = randomInt(rng, size);
    const right = randomInt(rng, size);
    [values[left], values[right]] = [values[right], values[left]];
  }

  return values;
}

function createReverseSortedDataset(size) {
  return Array.from({ length: size }, (_, index) => size - index);
}

function createDuplicatesDataset(size, seed) {
  return createRandomDataset(size, seed, 12);
}

function createLowValueRangeDataset(size, seed) {
  return createRandomDataset(size, seed, 48);
}

function createAdversarialPivotDataset(size) {
  const left = Array.from({ length: Math.ceil(size / 2) }, (_, index) => index + 1);
  const right = Array.from({ length: Math.floor(size / 2) }, (_, index) => size - index);
  return [...left, ...right];
}

const datasetBuilders = {
  "random-uniform": (size, seed) => createRandomDataset(size, seed),
  "nearly-sorted": (size, seed) => createNearlySortedDataset(size, seed),
  "reverse-sorted": (size) => createReverseSortedDataset(size),
  "many-duplicates": (size, seed) => createDuplicatesDataset(size, seed),
  "low-value-range": (size, seed) => createLowValueRangeDataset(size, seed),
  "adversarial-pivot": (size) => createAdversarialPivotDataset(size),
};

function datasetSeed(profile, sizeLabel) {
  const profileIndex = benchmarkProfiles.indexOf(profile) + 1;
  const sizeIndex = benchmarkSizes.indexOf(sizeLabel) + 1;
  return (profileIndex * 101) + (sizeIndex * 37);
}

export function createDatasets() {
  return Object.fromEntries(
    benchmarkProfiles.map((profile) => [
      profile,
      Object.fromEntries(
        Object.entries(datasetSizes).map(([sizeLabel, size]) => [
          sizeLabel,
          datasetBuilders[profile](size, datasetSeed(profile, sizeLabel)),
        ]),
      ),
    ]),
  );
}

export async function writeDatasets(tempDir, datasets) {
  const datasetPaths = {};

  for (const [profile, sizeMap] of Object.entries(datasets)) {
    datasetPaths[profile] = {};

    for (const [sizeLabel, values] of Object.entries(sizeMap)) {
      const filePath = path.join(tempDir, `${profile}-${sizeLabel}.txt`);
      await writeFile(filePath, `${values.join("\n")}\n`);
      datasetPaths[profile][sizeLabel] = filePath;
    }
  }

  return datasetPaths;
}

export function datasetProfileLabel() {
  return "small=100, medium=1000, large=10000";
}
