import type { Algorithm } from "../core/types";

type ExportCardProps = {
  algorithm: Algorithm;
  result: number[];
};

export function ExportCard({ algorithm, result }: ExportCardProps) {
  const maxValue = Math.max(...result, 1);

  return (
    <div
      id="export-card"
      className="pointer-events-none fixed -left-[10000px] top-0 w-[600px] rounded-lg border border-zinc-200 bg-white p-8 text-zinc-950 shadow-soft"
      aria-hidden="true"
    >
      <p className="text-sm font-semibold uppercase text-teal-700">Sort Playground</p>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight">{algorithm.name}</h2>
      <p className="mt-3 font-mono text-sm text-zinc-500">{algorithm.complexity}</p>
      <div className="mt-8 flex h-44 items-end gap-2 rounded-lg bg-zinc-950 p-4">
        {result.map((value, index) => (
          <div key={`${value}-${index}`} className="flex h-full flex-1 items-end">
            <div className="min-h-px w-full rounded-t-lg bg-teal-400" style={{ height: `${(value / maxValue) * 100}%` }} />
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm font-semibold text-zinc-500">Result</p>
      <p className="mt-2 break-words font-mono text-xl font-semibold">{result.join(" ")}</p>
    </div>
  );
}
