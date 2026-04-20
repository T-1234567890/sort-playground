import { strToU8, zipSync } from "fflate";
import type { AlgorithmCategory } from "./types";

export const DRAFT_ALGORITHM_STORAGE_KEY = "draft-algorithm";
export const REQUIRED_ALGORITHM_FILENAMES = ["meta.json", "steps.ts", "python.py", "rust.rs", "c.c"] as const;

export type DraftAlgorithmMetadata = {
  name: string;
  slug: string;
  category: AlgorithmCategory;
  description: string;
};

export type LoadedAlgorithmFiles = Record<(typeof REQUIRED_ALGORITHM_FILENAMES)[number], string>;

export type LoadedAlgorithmDraft = {
  slug: string;
  metadata: DraftAlgorithmMetadata;
  files: LoadedAlgorithmFiles;
};

export type GeneratedAlgorithmFile = {
  filename: string;
  path: string;
  content: string;
};

export type FileSystemWritableFileStreamLike = {
  write: (data: string) => Promise<void>;
  close: () => Promise<void>;
};

export type FileSystemReadableFileLike = {
  text: () => Promise<string>;
};

export type FileSystemFileHandleLike = {
  createWritable: () => Promise<FileSystemWritableFileStreamLike>;
  getFile: () => Promise<FileSystemReadableFileLike>;
};

export type FileSystemDirectoryHandleLike = {
  name: string;
  getDirectoryHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemDirectoryHandleLike>;
  getFileHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemFileHandleLike>;
};

export type DirectoryPickerWindow = Window & typeof globalThis & {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandleLike>;
};

export const defaultDraftAlgorithmCode = `export function algorithmSteps(input) {
  const array = [...input];
  const steps = [{ array: [...array], action: "compare", indices: [] }];

  for (let end = array.length - 1; end > 0; end -= 1) {
    for (let index = 0; index < end; index += 1) {
      steps.push({ array: [...array], action: "compare", indices: [index, index + 1] });

      if (array[index] > array[index + 1]) {
        [array[index], array[index + 1]] = [array[index + 1], array[index]];
        steps.push({ array: [...array], action: "swap", indices: [index, index + 1] });
      }
    }
  }

  steps.push({
    array: [...array],
    action: "sorted",
    indices: array.map((_, index) => index),
  });

  return steps;
}
`;

const slugPattern = /^[a-z]+(?:-[a-z]+)*$/;

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function snakeCaseFromSlug(slug: string) {
  return slug.replace(/-/g, "_");
}

function toTitleCase(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function slugifyAlgorithmName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isValidAlgorithmSlug(slug: string) {
  return slugPattern.test(slug);
}

export function stripPreviewOnlyImports(code: string) {
  return code.replace(/^\s*import\s+type\s+[^;]+;\s*$/gm, "").trim();
}

export function buildStepsModuleSource(code: string) {
  const trimmed = code.trim();
  const hasStepImport = /from\s+["']\.\.\/\.\.\/core\/types["']/.test(trimmed);

  if (hasStepImport) {
    return `${trimmed}\n`;
  }

  return `import type { Step } from "../../core/types";

${trimmed}
`;
}

export function buildAlgorithmFiles(metadata: DraftAlgorithmMetadata, code: string): GeneratedAlgorithmFile[] {
  const slug = metadata.slug.trim();
  const root = `src/algorithms/${slug}`;
  const safeName = metadata.name.trim() || toTitleCase(slug) || "New Sort";
  const description = metadata.description.trim();
  const functionName = snakeCaseFromSlug(slug) || "algorithm_sort";
  const meta = {
    name: safeName,
    category: metadata.category,
    complexity: "Unknown",
    description,
    visualization: "default",
    benchmark: false,
    special: "no-benchmark",
    added: todayString(),
  };

  return [
    {
      filename: "meta.json",
      path: `${root}/meta.json`,
      content: `${JSON.stringify(meta, null, 2)}\n`,
    },
    {
      filename: "steps.ts",
      path: `${root}/steps.ts`,
      content: buildStepsModuleSource(code),
    },
    {
      filename: "python.py",
      path: `${root}/python.py`,
      content: `def ${functionName}(values):
    values = values[:]
    # TODO: port the algorithm logic from steps.ts.
    return values
`,
    },
    {
      filename: "rust.rs",
      path: `${root}/rust.rs`,
      content: `pub fn ${functionName}(values: &mut [i32]) {
    // TODO: port the algorithm logic from steps.ts.
    let _ = values;
}
`,
    },
    {
      filename: "c.c",
      path: `${root}/c.c`,
      content: `void ${functionName}(int values[], int length) {
    /* TODO: port the algorithm logic from steps.ts. */
    (void) values;
    (void) length;
}
`,
    },
  ];
}

export function createAlgorithmBundle(files: GeneratedAlgorithmFile[]) {
  const archive = zipSync(
    Object.fromEntries(files.map((file) => [file.path, strToU8(file.content)])),
    { level: 6 },
  );
  const archiveCopy = new Uint8Array(archive.length);
  archiveCopy.set(archive);

  return new Blob([archiveCopy.buffer], { type: "application/zip" });
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function isAlgorithmCategory(value: string): value is AlgorithmCategory {
  return value === "classic" || value === "weird" || value === "meme";
}

async function readRequiredFile(directoryHandle: FileSystemDirectoryHandleLike, filename: (typeof REQUIRED_ALGORITHM_FILENAMES)[number]) {
  try {
    const fileHandle = await directoryHandle.getFileHandle(filename);
    const file = await fileHandle.getFile();
    return await file.text();
  } catch {
    throw new Error(`Missing ${filename}`);
  }
}

export async function loadAlgorithmFromDirectory(directoryHandle: FileSystemDirectoryHandleLike): Promise<LoadedAlgorithmDraft> {
  const slug = directoryHandle.name.trim();

  if (!slug || !isValidAlgorithmSlug(slug)) {
    throw new Error("Invalid structure");
  }

  const files = Object.fromEntries(
    await Promise.all(
      REQUIRED_ALGORITHM_FILENAMES.map(async (filename) => [filename, await readRequiredFile(directoryHandle, filename)] as const),
    ),
  ) as LoadedAlgorithmFiles;

  let parsedMeta: unknown;

  try {
    parsedMeta = JSON.parse(files["meta.json"]);
  } catch {
    throw new Error("meta.json is not valid JSON");
  }

  if (!parsedMeta || typeof parsedMeta !== "object") {
    throw new Error("meta.json is invalid");
  }

  const candidate = parsedMeta as Partial<Record<keyof DraftAlgorithmMetadata, unknown>>;
  const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
  const category = typeof candidate.category === "string" ? candidate.category : "";
  const description = typeof candidate.description === "string" ? candidate.description.trim() : "";

  if (!name || !description || !isAlgorithmCategory(category)) {
    throw new Error("meta.json is invalid");
  }

  if (!files["steps.ts"].trim()) {
    throw new Error("steps.ts is empty");
  }

  if (!files["python.py"].trim() || !files["rust.rs"].trim() || !files["c.c"].trim()) {
    throw new Error("Invalid structure");
  }

  return {
    slug,
    metadata: {
      name,
      slug,
      category,
      description,
    },
    files,
  };
}
