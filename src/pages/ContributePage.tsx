import { ArrowLeft, CheckCircle2, Copy, ExternalLink, FolderTree, GitPullRequest } from "lucide-react";
import { useState } from "react";
import { GitHubMark } from "../components/BrandIcons";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";

type ContributePageProps = {
  dark: boolean;
  onToggleDark: () => void;
};

const repoUrl = "https://github.com/T-1234567890/sort-playground";

const metaTemplate = `{
  "name": "Example Sort",
  "category": "classic",
  "complexity": "O(n log n)",
  "space": "O(n)",
  "stability": "Stable",
  "description": "Explain the algorithm in one clear sentence.",
  "author": "T-1234567890",
  "contributors": ["T-1234567890"],
  "added": "2026-04-19",
  "visualization": "default"
}`;

const stepsTemplate = `import type { Step } from "../../core/types";

export function exampleSortSteps(input: number[]): Step[] {
  const array = [...input];
  const steps: Step[] = [{ array: [...array], action: "compare", indices: [] }];

  // Add compare, swap, overwrite, or delete steps as the algorithm runs.

  steps.push({
    array: [...array],
    action: "sorted",
    indices: array.map((_, index) => index),
  });

  return steps;
}`;

const pythonTemplate = `def example_sort(values):
    values = values[:]
    # Keep the implementation readable and educational.
    return values`;

const rustTemplate = `pub fn example_sort(values: &mut [i32]) {
    // Keep the implementation readable and educational.
}`;

const cTemplate = `void example_sort(int values[], int length) {
    /* Keep the implementation readable and educational. */
}`;

const wizardSteps = [
  {
    title: "Choose the algorithm type",
    body: "Use classic for known teaching algorithms, weird for unusual mechanics, and meme for intentionally absurd behavior.",
  },
  {
    title: "Create the folder",
    body: "Add src/algorithms/<algorithm-slug>/ and keep the required five files together.",
  },
  {
    title: "Write metadata",
    body: "meta.json controls the explorer card, detail page, category, complexity, stability, and visualization mode.",
  },
  {
    title: "Generate steps",
    body: "steps.ts turns the algorithm into compare, swap, overwrite, delete, and sorted frames.",
  },
  {
    title: "Add code examples",
    body: "python.py, rust.rs, and c.c are shown directly in the UI for copying and downloading.",
  },
  {
    title: "Test locally",
    body: "Run the app, open the algorithm page, check the visualizer, and make sure the code snippets are readable.",
  },
  {
    title: "Open a PR",
    body: "Describe the algorithm, include screenshots or a GIF when useful, and call out custom visualization behavior.",
  },
];

const categoryOptions = [
  ["Classic", "Clear, useful algorithms people expect to study."],
  ["Weird", "Unusual mechanics that still teach something."],
  ["Meme", "Absurd sorts, jokes, and intentionally inefficient ideas."],
];

const fileRoles = [
  ["meta.json", "Name, category, complexity, stability, contributor credit, and visualization mode."],
  ["steps.ts", "The animation timeline. Each step stores the current array, action, and active indices."],
  ["python.py", "Readable Python reference implementation."],
  ["rust.rs", "Readable Rust reference implementation."],
  ["c.c", "Readable C reference implementation."],
];

const checklist = [
  "The folder name is lowercase and URL-friendly.",
  "The algorithm appears in the explorer.",
  "The visualization reaches the intended final state.",
  "Custom visualization ideas are explained in the PR.",
  "Python, Rust, and C examples are simple enough to learn from.",
  "No core architecture changes are included unless the PR explains why.",
];

type TemplateBlockProps = {
  title: string;
  language: string;
  code: string;
};

function TemplateBlock({ title, language, code }: TemplateBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-950/10 bg-zinc-950 text-zinc-100 shadow-soft dark:border-white/10">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs text-zinc-400">{language}</p>
        </div>
        <button
          type="button"
          onClick={() => void copyCode()}
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
        >
          <Copy size={14} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-80 overflow-auto p-4 text-sm leading-6 text-teal-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function ContributePage({ dark, onToggleDark }: ContributePageProps) {
  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main>
        <section className="border-b border-zinc-950/10 bg-white/60 dark:border-white/10 dark:bg-white/5">
          <div className="mx-auto max-w-6xl px-5 py-10">
            <a
              data-route
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:-translate-x-0.5 dark:border-white/10 dark:bg-white/10"
            >
              <ArrowLeft size={16} />
              Sort Playground
            </a>

            <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">Contribution Wizard</p>
                <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
                  Add a sort without reading the whole codebase.
                </h1>
                <p className="mt-6 max-w-2xl text-xl leading-8 text-zinc-600 dark:text-zinc-300">
                  The roadmap calls for a guided `/contribute` page. This is the path from idea to pull request.
                </p>
              </div>

              <div className="rounded-lg border border-zinc-950/10 bg-zinc-950 p-5 text-white shadow-soft dark:border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src="https://github.com/T-1234567890.png"
                    alt="@T-1234567890"
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm text-zinc-400">Maintainer</p>
                    <p className="font-semibold">@T-1234567890</p>
                  </div>
                </div>
                <a
                  href={repoUrl}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5"
                >
                  <GitHubMark className="h-4 w-4" />
                  Open repository
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12">
          <div className="grid gap-4 sm:grid-cols-3">
            {categoryOptions.map(([title, body]) => (
              <div key={title} className="rounded-lg border border-zinc-950/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/8">
                <p className="text-lg font-semibold">{title}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div>
            <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">Roadmap flow</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Seven steps to a clean algorithm PR.</h2>
          </div>
          <ol className="grid gap-4">
            {wizardSteps.map((step, index) => (
              <li key={step.title} className="grid gap-4 rounded-lg border border-zinc-950/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/8 sm:grid-cols-[56px_minmax(0,1fr)]">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-500 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="text-lg font-semibold">{step.title}</p>
                  <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-300">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="flex items-center gap-3">
              <FolderTree className="h-6 w-6 text-teal-600 dark:text-teal-300" />
              <h2 className="text-3xl font-semibold tracking-tight">Required folder structure</h2>
            </div>
            <pre className="mt-5 overflow-auto rounded-lg bg-zinc-950 p-5 text-sm leading-7 text-teal-100">
              <code>{`src/algorithms/<algorithm-slug>/
  meta.json
  steps.ts
  python.py
  rust.rs
  c.c`}</code>
            </pre>
          </div>

          <div className="space-y-4">
            {fileRoles.map(([file, role]) => (
              <div key={file} className="border-l-2 border-teal-500/50 pl-4">
                <p className="font-mono text-sm font-semibold">{file}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{role}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12">
          <div className="mb-6 max-w-2xl">
            <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">Starter templates</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Copy the shape, then fill in the algorithm.</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <TemplateBlock title="meta.json" language="JSON" code={metaTemplate} />
            <TemplateBlock title="steps.ts" language="TypeScript" code={stepsTemplate} />
            <TemplateBlock title="python.py" language="Python" code={pythonTemplate} />
            <TemplateBlock title="rust.rs" language="Rust" code={rustTemplate} />
            <TemplateBlock title="c.c" language="C" code={cTemplate} />
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">Before opening a PR</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Check the work like a reviewer will.</h2>
            <ul className="mt-6 grid gap-3">
              {checklist.map((item) => (
                <li key={item} className="flex gap-3 text-zinc-700 dark:text-zinc-200">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-zinc-950/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/8">
            <GitPullRequest className="h-7 w-7 text-teal-600 dark:text-teal-300" />
            <p className="mt-4 text-xl font-semibold">Useful links</p>
            <div className="mt-5 grid gap-3 text-sm font-semibold">
              <a className="inline-flex items-center justify-between rounded-lg bg-zinc-950 px-4 py-3 text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950" href={`${repoUrl}/blob/main/docs/roadmap.md`}>
                Public roadmap
                <ExternalLink size={16} />
              </a>
              <a className="inline-flex items-center justify-between rounded-lg border border-zinc-950/10 px-4 py-3 transition hover:-translate-y-0.5 dark:border-white/10" href={`${repoUrl}/blob/main/docs/adding-algorithms.md`}>
                Adding algorithms guide
                <ExternalLink size={16} />
              </a>
              <a className="inline-flex items-center justify-between rounded-lg border border-zinc-950/10 px-4 py-3 transition hover:-translate-y-0.5 dark:border-white/10" href={`${repoUrl}/pulls`}>
                Open a pull request
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
