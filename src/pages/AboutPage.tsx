import { ArrowLeft } from "lucide-react";
import { GitHubMark } from "../components/BrandIcons";
import { Footer } from "../components/Footer";
import { Shell } from "../components/Shell";

type AboutPageProps = {
  dark: boolean;
  onToggleDark: () => void;
};

export function AboutPage({ dark, onToggleDark }: AboutPageProps) {
  return (
    <Shell dark={dark} onToggleDark={onToggleDark}>
      <main className="mx-auto max-w-5xl px-5 py-10">
        <a
          data-route
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:-translate-x-0.5 dark:border-white/10 dark:bg-white/10"
        >
          <ArrowLeft size={16} />
          Sort Playground
        </a>

        <section className="mt-14 max-w-3xl">
          <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">About</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">Watch algorithms, not diagrams.</h1>
          <p className="mt-6 text-2xl font-semibold tracking-tight text-zinc-700 dark:text-zinc-200">
            Sort Playground turns code into motion.
          </p>
          <div className="mt-6 max-w-2xl space-y-2 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            <p>Explore classic, weird, and absurd sorting algorithms step by step.</p>
            <p>Copy real implementations. Export results. Contribute your own.</p>
          </div>
        </section>

        <section className="mt-12 max-w-2xl border-l-2 border-teal-500/50 pl-5">
          <p className="text-lg leading-8 text-zinc-700 dark:text-zinc-200">This is a small project built mostly for fun.</p>
          <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            It started as something to play with — a way to see algorithms instead of just reading them — and slowly turned into something worth sharing.
          </p>
        </section>

        <section className="mt-16 grid gap-12 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">Why this exists</p>
            <div className="mt-4 space-y-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
              <p>Most algorithm explanations are static.</p>
              <p>You read code, you see diagrams, but you don't actually see what happens.</p>
              <p>Sort Playground exists because watching something change is often easier than trying to imagine it.</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">How it works</p>
            <div className="mt-4 space-y-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
              <p>Each algorithm is broken into small, readable steps.</p>
              <p>The page replays those steps so you can follow each decision as it happens.</p>
              <p>
                No mystery animation.
                <br />
                Just values changing, one move at a time.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">What makes it different</p>
            <div className="mt-4 space-y-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
              <p>This is not just another sorting visualizer.</p>
              <p>It includes:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>classic algorithms</li>
                <li>inefficient experiments</li>
                <li>weird and meme sorts</li>
              </ul>
              <p>You can:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>watch every step</li>
                <li>copy real implementations (Python, Rust, C)</li>
                <li>export results</li>
                <li>contribute your own algorithms via GitHub</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-lg bg-white/60 p-6 shadow-soft ring-1 ring-zinc-950/5 backdrop-blur-xl dark:bg-white/8 dark:ring-white/10">
          <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">Portable by design</p>
          <div className="mt-5 grid gap-6 text-lg leading-8 text-zinc-700 dark:text-zinc-200 sm:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-1 font-mono text-base font-semibold">
              <p>Open the page.</p>
              <p>Run the sort.</p>
              <p>Export the result.</p>
            </div>
            <div className="space-y-1 text-zinc-600 dark:text-zinc-300">
              <p>Everything feels local and immediate.</p>
              <p>The tool stays fast, portable, and easy to share.</p>
            </div>
          </div>
        </section>

        <section className="mt-16 max-w-2xl">
          <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">Maintainer</p>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">Maintained by</p>
          <a
            href="https://github.com/T-1234567890"
            className="mt-4 inline-flex items-center gap-3 rounded-lg border border-zinc-950/10 bg-white/70 px-4 py-3 font-semibold transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/12"
          >
            <img src="https://github.com/T-1234567890.png" alt="@T-1234567890" className="h-8 w-8 rounded-lg object-cover" />
            @T-1234567890
            <GitHubMark className="h-4 w-4 text-zinc-500" />
          </a>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
