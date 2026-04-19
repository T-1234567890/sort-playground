import { Activity, Code2, FileCode2, GitPullRequestArrow, ImageDown, Share2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Algorithm } from "../core/types";

const previewInput = [46, 18, 71, 12, 63, 29, 88, 54, 33, 77, 21, 60];

type HeroPreviewProps = {
  algorithms: Algorithm[];
};

export function HeroPreview({ algorithms }: HeroPreviewProps) {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);
  const activePointerId = useRef<number | null>(null);

  const algorithm = useMemo(() => {
    return algorithms.find((item) => item.slug === "quick-sort") ?? algorithms[0];
  }, [algorithms]);

  const steps = useMemo(() => algorithm?.steps(previewInput) ?? [], [algorithm]);
  const step = steps[stepIndex] ?? steps[0];
  const maxValue = Math.max(...previewInput, 1);

  useEffect(() => {
    if (!steps.length) {
      return;
    }

    const interval = window.setInterval(() => {
      setStepIndex((index) => (index + 1) % steps.length);
    }, 420);

    return () => window.clearInterval(interval);
  }, [steps.length]);

  const features = useMemo(
    () => [
      {
        label: t("heroShowcase.live.label"),
        title: t("heroShowcase.live.title"),
        description: t("heroShowcase.live.description"),
        icon: Activity,
      },
      {
        label: t("heroShowcase.code.label"),
        title: t("heroShowcase.code.title"),
        description: t("heroShowcase.code.description"),
        icon: Code2,
      },
      {
        label: t("heroShowcase.export.label"),
        title: t("heroShowcase.export.title"),
        description: t("heroShowcase.export.description"),
        icon: ImageDown,
      },
      {
        label: t("heroShowcase.contribute.label"),
        title: t("heroShowcase.contribute.title"),
        description: t("heroShowcase.contribute.description"),
        icon: GitPullRequestArrow,
      },
    ],
    [t],
  );

  function goToFeature(index: number) {
    setActiveFeature((index + features.length) % features.length);
  }

  function finishSwipe(clientX: number) {
    if (swipeStartX.current === null) {
      return;
    }

    const delta = swipeStartX.current - clientX;
    swipeStartX.current = null;
    swipeStartY.current = null;
    activePointerId.current = null;
    setDragOffset(0);
    setIsDragging(false);

    if (Math.abs(delta) < 48) {
      return;
    }

    goToFeature(activeFeature + (delta > 0 ? 1 : -1));
  }

  function cancelSwipe() {
    swipeStartX.current = null;
    swipeStartY.current = null;
    activePointerId.current = null;
    setDragOffset(0);
    setIsDragging(false);
  }

  function getCardPosition(index: number) {
    const offset = (index - activeFeature + features.length) % features.length;

    if (offset === 0) {
      return "active";
    }

    if (offset === 1) {
      return "next";
    }

    if (offset === features.length - 1) {
      return "previous";
    }

    return "hidden";
  }

  function getCardClass(position: string) {
    if (position === "active") {
      return "z-30 opacity-100";
    }

    if (position === "previous") {
      return "z-20 opacity-35";
    }

    if (position === "next") {
      return "z-10 opacity-25";
    }

    return "z-0 opacity-0";
  }

  function getCardStyle(position: string) {
    if (position === "active") {
      return {
        transform: `translateX(${dragOffset}px) translateY(0) scale(${isDragging ? 0.99 : 1})`,
      };
    }

    if (position === "previous") {
      return {
        transform: `translateX(${-24 + dragOffset * 0.22}px) translateY(20px) scale(0.94)`,
      };
    }

    if (position === "next") {
      return {
        transform: `translateX(${24 + dragOffset * 0.22}px) translateY(32px) scale(0.92)`,
      };
    }

    return {
      transform: "translateX(0) translateY(40px) scale(0.9)",
    };
  }

  function renderFeatureBody(index: number) {
    if (index === 0) {
      return (
        <>
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
            <span>{algorithm?.name}</span>
            <span className="rounded-lg bg-white/10 px-2 py-1 text-white">{step?.action ?? "compare"}</span>
          </div>
          <div className="mt-4 flex h-52 items-stretch gap-2">
            {(step?.array ?? previewInput).map((value, barIndex) => {
              const active = step?.indices?.includes(barIndex);
              const color =
                step?.action === "sorted"
                  ? "bg-emerald-400"
                  : active && step?.action === "compare"
                    ? "bg-amber-400"
                    : active
                      ? "bg-rose-500"
                      : "bg-zinc-500";

              return (
                <div key={`quick-sort-${barIndex}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="flex min-h-0 w-full flex-1 items-end">
                    <div
                      className={`min-h-px w-full rounded-t-lg transition-all duration-300 ${color}`}
                      style={{ height: `${(value / maxValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium tabular-nums text-zinc-300">{value}</span>
                </div>
              );
            })}
          </div>
        </>
      );
    }

    if (index === 1) {
      return (
        <div className="min-h-64">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <FileCode2 size={14} />
            <span>Python · Rust · C</span>
          </div>
          <pre className="mt-4 overflow-hidden rounded-lg bg-black/40 p-4 text-xs leading-6 text-teal-100">
            <code>{`def quick_sort(values):
    if len(values) <= 1:
        return values

    pivot = values[-1]
    left = [x for x in values[:-1] if x <= pivot]
    right = [x for x in values[:-1] if x > pivot]

    return quick_sort(left) + [pivot] + quick_sort(right)`}</code>
          </pre>
        </div>
      );
    }

    if (index === 2) {
      return (
        <div className="grid min-h-64 content-center gap-3">
          {[
            ["PNG", t("heroShowcase.export.png")],
            ["GIF", t("heroShowcase.export.gif")],
            ["Embed", t("heroShowcase.export.embed")],
          ].map(([label, description]) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-1 text-xs text-zinc-300">{description}</p>
              </div>
              <Share2 size={16} className="text-teal-300" />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid min-h-64 content-center gap-3">
        {[
          t("heroShowcase.contribute.metadata"),
          t("heroShowcase.contribute.steps"),
          "Python",
          "Rust",
          "C",
        ].map((file) => (
          <div key={file} className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3">
            <span className="font-mono text-sm">{file}</span>
            <span className="h-2 w-2 rounded-full bg-teal-300" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-rise-in">
      <div
        className={`relative h-[520px] touch-pan-y select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={(event) => {
          if (event.button !== 0 && event.pointerType === "mouse") {
            return;
          }

          swipeStartX.current = event.clientX;
          swipeStartY.current = event.clientY;
          activePointerId.current = event.pointerId;
          setIsDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (activePointerId.current !== event.pointerId || swipeStartX.current === null) {
            return;
          }

          const xDelta = event.clientX - swipeStartX.current;
          const yDelta = event.clientY - (swipeStartY.current ?? event.clientY);

          if (Math.abs(yDelta) > Math.abs(xDelta) && Math.abs(yDelta) > 18) {
            cancelSwipe();
            return;
          }

          setDragOffset(Math.max(-120, Math.min(120, xDelta)));
        }}
        onPointerUp={(event) => {
          if (activePointerId.current !== event.pointerId) {
            return;
          }

          finishSwipe(event.clientX);
        }}
        onPointerCancel={cancelSwipe}
        onPointerLeave={(event) => {
          if (activePointerId.current === event.pointerId) {
            finishSwipe(event.clientX);
          }
        }}
      >
        {features.map((item, index) => {
          const position = getCardPosition(index);
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className={`absolute inset-x-0 top-0 rounded-lg border border-zinc-950/10 bg-white/80 p-4 shadow-soft backdrop-blur-xl transition-[opacity,transform] dark:border-white/10 dark:bg-zinc-950/80 ${
                isDragging ? "duration-75" : "duration-300"
              } ${getCardClass(position)}`}
              style={getCardStyle(position)}
              aria-hidden={position !== "active"}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">{item.label}</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight">{item.title}</p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.description}</p>
                </div>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                  <Icon size={18} />
                </span>
              </div>

              <div className="mt-5 overflow-hidden rounded-lg bg-zinc-950 p-4 text-white">
                {renderFeatureBody(index)}
              </div>

              {index === 0 ? (
                <div className="mt-4 h-1.5 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-lg bg-teal-500 transition-[width] duration-300"
                    style={{ width: `${steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 0}%` }}
                  />
                </div>
              ) : null}
            </article>
          );
        })}
        <div className="absolute inset-x-0 bottom-0 z-40 flex justify-center gap-2">
          {features.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => goToFeature(index)}
              className={`h-2.5 rounded-full transition ${
                index === activeFeature ? "w-7 bg-teal-500" : "w-2.5 bg-zinc-300 dark:bg-zinc-700"
              }`}
              aria-label={t("heroShowcase.goTo", { name: item.title })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
