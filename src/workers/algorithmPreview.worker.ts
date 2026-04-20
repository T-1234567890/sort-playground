import ts from "typescript";
import type { Step, StepAction } from "../core/types";

type PreviewRequest = {
  id: number;
  code: string;
  input: number[];
};

type PreviewSuccess = {
  id: number;
  ok: true;
  steps: Step[];
};

type PreviewFailure = {
  id: number;
  ok: false;
  error: string;
};

const allowedActions = new Set<StepAction>(["compare", "swap", "overwrite", "delete", "sorted"]);
const blockedPatterns: Array<[RegExp, string]> = [
  [/^\s*import\s/m, "Preview code must stay self-contained. Remove import statements."],
  [/\bimportScripts\s*\(/, "External script loading is not available in the preview runner."],
];

function normalizeStep(step: unknown, index: number): Step {
  if (!step || typeof step !== "object") {
    throw new Error(`Step ${index + 1} is not an object.`);
  }

  const candidate = step as {
    action?: unknown;
    array?: unknown;
    indices?: unknown;
  };

  if (!Array.isArray(candidate.array) || candidate.array.some((value) => !Number.isFinite(value))) {
    throw new Error(`Step ${index + 1} must include a numeric array.`);
  }

  if (typeof candidate.action !== "string" || !allowedActions.has(candidate.action as StepAction)) {
    throw new Error(`Step ${index + 1} has an unsupported action.`);
  }

  const indices = Array.isArray(candidate.indices)
    ? candidate.indices.filter((value): value is number => Number.isInteger(value))
    : undefined;

  return {
    array: candidate.array.map((value) => Number(value)),
    action: candidate.action as StepAction,
    indices,
  };
}

async function loadRunner(source: string) {
  const transpiled = transpileSource(source);
  const moduleSource = `${transpiled}

const __previewCandidate =
  typeof algorithmSteps === "function" ? algorithmSteps :
  typeof draftAlgorithmSteps === "function" ? draftAlgorithmSteps :
  typeof sortSteps === "function" ? sortSteps :
  typeof previewSteps === "function" ? previewSteps :
  null;

export { __previewCandidate };
`;
  const blobUrl = URL.createObjectURL(new Blob([moduleSource], { type: "text/javascript" }));

  try {
    const module = await import(/* @vite-ignore */ blobUrl);
    const exportedFunctions = Object.values(module).filter((value) => typeof value === "function");
    const candidate = module.__previewCandidate ?? module.default ?? exportedFunctions[0];

    if (typeof candidate !== "function") {
      throw new Error("Export a function such as `export function algorithmSteps(input) { ... }`.");
    }

    return candidate as (input: number[]) => Step[] | Promise<Step[]>;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

function validateSource(source: string) {
  for (const [pattern, message] of blockedPatterns) {
    if (pattern.test(source)) {
      throw new Error(message);
    }
  }
}

function transpileSource(source: string) {
  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      isolatedModules: true,
      verbatimModuleSyntax: true,
    },
    reportDiagnostics: true,
  });

  const firstError = result.diagnostics?.find((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);

  if (firstError) {
    const message = ts.flattenDiagnosticMessageText(firstError.messageText, "\n");
    throw new Error(message);
  }

  return result.outputText;
}

self.onmessage = async (event: MessageEvent<PreviewRequest>) => {
  const { code, id, input } = event.data;

  try {
    validateSource(code);

    const runner = await loadRunner(code);
    const result = await runner([...input]);

    if (!Array.isArray(result)) {
      throw new Error("The exported function must return an array of preview steps.");
    }

    if (result.length === 0) {
      throw new Error("The preview returned no steps.");
    }

    const steps = result.map((step, index) => normalizeStep(step, index));
    self.postMessage({
      id,
      ok: true,
      steps,
    } satisfies PreviewSuccess);
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      error: error instanceof Error ? error.message : "Preview failed.",
    } satisfies PreviewFailure);
  }
};
