export type StepAction = "compare" | "swap" | "delete" | "sorted";

export type Step = {
  array: number[];
  action: StepAction;
  indices?: number[];
};

export type AlgorithmCategory = "classic" | "weird" | "meme";

export type AlgorithmMeta = {
  name: string;
  category: AlgorithmCategory;
  complexity: string;
  description: string;
  spaceComplexity?: string;
  stability?: string;
  author?: string;
  contributors?: string[];
  added?: string;
  keywords?: string[];
  funRank?: number;
};

export type CodeSnippets = {
  python: string;
  rust: string;
  c: string;
};

export type Algorithm = AlgorithmMeta & {
  slug: string;
  steps: (input: number[]) => Step[];
  code: CodeSnippets;
};
