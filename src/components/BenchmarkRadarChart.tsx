import {
  benchmarkProfiles,
  clampScore,
  displayProfileScores,
  formatBenchmarkScore,
  getPerformanceColors,
  radarAxisPoint,
  radarGridPoints,
  radarPoints,
} from "../core/benchmark";
import { useSettings } from "../hooks/useSettings";
import type { BenchmarkLanguage, BenchmarkProfileScores } from "../core/types";

type BenchmarkRadarSeries = {
  language: BenchmarkLanguage;
  scores: BenchmarkProfileScores;
};

type BenchmarkRadarChartProps = {
  scores?: BenchmarkProfileScores;
  language?: BenchmarkLanguage;
  series?: BenchmarkRadarSeries[];
  unitLabel: string;
  labels: Record<string, string>;
  profileDescriptions?: Partial<Record<string, string>>;
};

const SERIES_COLORS: Record<BenchmarkLanguage, { stroke: string; fill: string; dot: string }> = {
  python: {
    stroke: "rgb(14 116 144)",
    fill: "rgba(34, 211, 238, 0.18)",
    dot: "rgb(8 145 178)",
  },
  rust: {
    stroke: "rgb(5 150 105)",
    fill: "rgba(16, 185, 129, 0.18)",
    dot: "rgb(4 120 87)",
  },
  c: {
    stroke: "rgb(234 88 12)",
    fill: "rgba(251, 146, 60, 0.18)",
    dot: "rgb(194 65 12)",
  },
};

function compositeFor(scores: BenchmarkProfileScores) {
  return benchmarkProfiles.reduce((sum, profile) => sum + clampScore(scores[profile]), 0) / benchmarkProfiles.length;
}

export function BenchmarkRadarChart({
  scores,
  language,
  series,
  unitLabel,
  labels,
  profileDescriptions,
}: BenchmarkRadarChartProps) {
  const { settings } = useSettings();
  const activeSeries = series ?? (scores && language ? [{ language, scores }] : []);
  const displayedSeries = activeSeries.map((item) => ({
    language: item.language,
    scores: displayProfileScores(item.scores, settings.scoreDisplay),
  }));
  const leadingSeries = displayedSeries[0];
  const leadingComposite = leadingSeries ? compositeFor(leadingSeries.scores) : 0;
  const leadingColors = getPerformanceColors(leadingComposite);
  const center = 110;
  const radius = 72;
  const levels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="rounded-lg border border-zinc-950/8 bg-zinc-50/80 p-5 dark:border-white/10 dark:bg-zinc-950/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{unitLabel}</p>
          <p className="mt-2 text-lg font-semibold">
            {displayedSeries.length > 1 ? displayedSeries.map((item) => labels[item.language]).join(" · ") : leadingSeries ? labels[leadingSeries.language] : "-"}
          </p>
        </div>
        <div
          className="rounded-full border px-3 py-1 text-sm font-semibold"
          style={{ backgroundColor: leadingColors.background, borderColor: leadingColors.border, color: leadingColors.foreground }}
        >
          {formatBenchmarkScore(leadingComposite, 1, settings.scoreDisplay)}
        </div>
      </div>

      {activeSeries.length > 1 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {displayedSeries.map((item) => (
            <div key={item.language} className="inline-flex items-center gap-2 rounded-full border border-zinc-950/8 bg-white/80 px-3 py-1 text-xs font-semibold dark:border-white/10 dark:bg-white/10">
              <span
                className="inline-flex h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: SERIES_COLORS[item.language].stroke }}
              />
              <span>{labels[item.language]}</span>
              <span className="text-zinc-500 dark:text-zinc-400">{formatBenchmarkScore(compositeFor(item.scores), 1, settings.scoreDisplay)}</span>
            </div>
          ))}
        </div>
      ) : null}

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
                  <title>{profileDescriptions?.[profile] ?? labels[profile]}</title>
                  {labels[profile]}
                </text>
              </g>
            );
          })}

          {displayedSeries.map((item) => {
            const radarColor = SERIES_COLORS[item.language];
            const points = radarPoints(item.scores, radius, center).split(" ");

            return (
              <g key={item.language}>
                <polygon
                  points={points.join(" ")}
                  fill={radarColor.fill}
                  stroke={radarColor.stroke}
                  strokeWidth="2"
                >
                  <title>{`${labels[item.language]}: ${formatBenchmarkScore(compositeFor(item.scores), 1, settings.scoreDisplay)}`}</title>
                </polygon>
                {benchmarkProfiles.map((profile, index) => {
                  const [x, y] = points[index].split(",").map(Number);

                  return (
                    <circle key={`${item.language}-${profile}-dot`} cx={x} cy={y} r="3.5" fill={radarColor.dot}>
                      <title>{`${labels[item.language]} • ${labels[profile]}: ${formatBenchmarkScore(clampScore(item.scores[profile]), 1, settings.scoreDisplay)}. ${profileDescriptions?.[profile] ?? ""}`.trim()}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
