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

export type CommunityCodeExampleMeta = {
  id: string;
  language: string;
  file: string;
  contributor: string;
  contributorUrl?: string;
  label?: string;
  sourceUrl?: string;
};

export type CommunityCodeExample = CommunityCodeExampleMeta & {
  code: string;
};

export type Algorithm = AlgorithmMeta & {
  slug: string;
  steps: (input: number[]) => Step[];
  code: CodeSnippets;
  communityExamples?: CommunityCodeExample[];
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

export type BenchmarkSize = "small" | "medium" | "large";
export type BenchmarkLanguage = "python" | "rust" | "c";
export type BenchmarkWorkloadProfile =
  | "random-uniform"
  | "nearly-sorted"
  | "reverse-sorted"
  | "many-duplicates"
  | "low-value-range"
  | "adversarial-pivot";
export type BenchmarkTier = "lite" | "standard" | "extreme";
export type BenchmarkRunMode = "small" | "full";

export type BenchmarkResults = Record<BenchmarkSize, number>;
export type BenchmarkLanguageResults = Record<BenchmarkLanguage, BenchmarkResults>;
export type BenchmarkProfileScores = Partial<Record<BenchmarkWorkloadProfile, number>>;
export type BenchmarkLanguageProfileScores = Partial<Record<BenchmarkLanguage, BenchmarkProfileScores>>;
export type BenchmarkLanguageSizeScores = Partial<Record<BenchmarkLanguage, Partial<Record<BenchmarkSize, number>>>>;

export type BenchmarkEnvironmentMetadata = {
  benchmarkSpecVersion?: string;
  runnerOs?: string;
  cpu?: string;
  nodeVersion?: string;
  pythonVersion?: string;
  rustVersion?: string;
  compilerVersion?: string;
  workflowRunId?: string;
};

export type BenchmarkHarnessSnapshot = {
  datasetGenerator?: string;
  datasetProfile?: string;
  warmupPolicy?: string;
  runCountPolicy?: string;
  timeoutPolicy?: string;
  memoryConstraints?: string;
  correctnessValidation?: string;
  languageRunnerContract?: string;
  dimensionWeights?: Partial<Record<BenchmarkWorkloadProfile, number>>;
};

export type BenchmarkScoreSnapshot = {
  normalized?: number;
  composite?: number;
  percentile?: number;
  badges?: string[];
  rawAverageMs?: number;
  dimensionScores?: BenchmarkLanguageProfileScores;
  sizeScores?: BenchmarkLanguageSizeScores;
};

export type BenchmarkSystemSnapshot = {
  workloadProfiles?: Partial<Record<BenchmarkWorkloadProfile, BenchmarkLanguageResults>>;
  tiers?: Partial<Record<BenchmarkTier, BenchmarkLanguageResults>>;
  environment?: BenchmarkEnvironmentMetadata;
  harness?: BenchmarkHarnessSnapshot;
  score?: BenchmarkScoreSnapshot;
};

export type BenchmarkRankingEntry = {
  name: string;
  slug: string;
  mode: "automated" | "estimated" | "none";
  results?: BenchmarkLanguageResults;
  complexity?: string;
  relativeRank?: "high" | "medium" | "low";
  unit?: string;
  status: "benchmarked" | "exempt" | "estimated";
  reason?: string;
  metadata?: {
    source?: string;
    benchmarkMode?: "automated" | "estimated" | "none";
    algorithmHash?: string;
    lastRunAt?: string;
    lastRunMode?: BenchmarkRunMode;
  };
  snapshot?: BenchmarkSystemSnapshot;
};
