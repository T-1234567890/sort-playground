import { benchmarkProfiles, clampScore, getPerformanceColors, radarAxisPoint, radarGridPoints, radarPoints } from "../core/benchmark";
import type { BenchmarkLanguage, BenchmarkProfileScores } from "../core/types";

type BenchmarkRadarChartProps = {
  scores: BenchmarkProfileScores;
  language: BenchmarkLanguage;
  unitLabel: string;
  labels: Record<string, string>;
};

export function BenchmarkRadarChart({ scores, language, unitLabel, labels }: BenchmarkRadarChartProps) {
  const composite = benchmarkProfiles.reduce((sum, profile) => sum + clampScore(scores[profile]), 0) / benchmarkProfiles.length;
  const colors = getPerformanceColors(composite);
  const center = 110;
  const radius = 72;
  const levels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="rounded-lg border border-zinc-950/8 bg-zinc-50/80 p-5 dark:border-white/10 dark:bg-zinc-950/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{unitLabel}</p>
          <p className="mt-2 text-lg font-semibold">{labels[language]}</p>
        </div>
        <div
          className="rounded-full border px-3 py-1 text-sm font-semibold"
          style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }}
        >
          {composite.toFixed(1)}
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <svg viewBox="0 0 220 220" className="h-auto w-full max-w-[320px]">
          {levels.map((level) => (
            <polygon
              key={level}
              points={radarGridPoints(radius, center, level)}
              fill="none"
              stroke="rgba(113,113,122,0.22)"
              strokeWidth="1"
            />
          ))}

          {benchmarkProfiles.map((profile, index) => {
            const point = radarAxisPoint(radius, center, index);

            return (
              <g key={profile}>
                <line x1={center} y1={center} x2={point.lineX} y2={point.lineY} stroke="rgba(113,113,122,0.22)" strokeWidth="1" />
                <text
                  x={point.x}
                  y={point.y}
                  textAnchor={point.x < center - 8 ? "end" : point.x > center + 8 ? "start" : "middle"}
                  dominantBaseline={point.y < center - 8 ? "alphabetic" : point.y > center + 8 ? "hanging" : "middle"}
                  className="fill-zinc-500 text-[10px] dark:fill-zinc-400"
                >
                  {labels[profile]}
                </text>
              </g>
            );
          })}

          <polygon
            points={radarPoints(scores, radius, center)}
            fill={colors.background}
            fillOpacity="0.45"
            stroke={colors.border}
            strokeWidth="2"
          />

          {benchmarkProfiles.map((profile, index) => {
            const pointString = radarPoints(scores, radius, center).split(" ")[index];
            const [x, y] = pointString.split(",").map(Number);

            return <circle key={`${profile}-dot`} cx={x} cy={y} r="3.5" fill={colors.border} />;
          })}
        </svg>
      </div>
    </div>
  );
}
