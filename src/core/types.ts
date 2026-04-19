export type StepAction = "compare" | "swap" | "overwrite" | "delete" | "sorted";

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
  space?: string;
  spaceComplexity?: string;
  stability?: string;
  visualization?: "default" | "custom";
  author?: string;
  contributors?: string[];
  added?: string;
  keywords?: string[];
  funRank?: number;
  benchmark?: boolean;
  benchmarkMode?: "automated" | "estimated" | "none";
  benchmarkRelativeRank?: "high" | "medium" | "low";
  special?: "no-benchmark";
  eventEligible?: boolean;
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

export type SortLabsEvent = {
  id: string;
  name: string;
  description: string;
  theme?: string;
  status: "active" | "upcoming" | "closed";
  startDate?: string;
  endDate?: string;
  categories?: string[];
};

export type CommunityRankingEntry = {
  name: string;
  slug: string;
  score: number;
  url: string;
  author: string;
  category: string;
  event?: string;
  why?: string;
  source?: "discussion";
};

export type BenchmarkRankingEntry = {
  name: string;
  slug: string;
  mode: "automated" | "estimated" | "none";
  average?: number | null;
  complexity?: string;
  relativeRank?: "high" | "medium" | "low";
  unit?: string;
  status: "benchmarked" | "exempt" | "estimated";
  reason?: string;
  metadata?: {
    source?: string;
    benchmarkMode?: "automated" | "estimated" | "none";
  };
  runs: number[];
  datasets?: {
    small: number;
    medium: number;
    large: number;
  };
};
