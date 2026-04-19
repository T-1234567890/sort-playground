import GIF from "gif.js";
import gifWorkerUrl from "gif.js/dist/gif.worker.js?url";
import type { Algorithm, Step } from "./types";

export type ExportPayload = {
  algorithm: Algorithm;
  result: number[];
  currentArray: number[];
  steps?: Step[];
};

type CardVariant = "result" | "share";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadTextFile(content: string, filename: string) {
  triggerDownload(new Blob([content], { type: "text/plain;charset=utf-8" }), filename);
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
}

function drawBars(context: CanvasRenderingContext2D, values: number[], x: number, y: number, width: number, height: number) {
  const maxValue = Math.max(...values, 1);
  const gap = 8;
  const barWidth = Math.max(8, (width - gap * (values.length - 1)) / values.length);

  values.forEach((value, index) => {
    const barHeight = Math.max(1, (Math.max(value, 0) / maxValue) * height);
    const barX = x + index * (barWidth + gap);
    const barY = y + height - barHeight;
    context.fillStyle = "#14b8a6";
    roundedRect(context, barX, barY, barWidth, barHeight, 6);
  });
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;

  for (const word of words) {
    const testLine = `${line}${word} `;
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line.trim(), x, y);
      line = `${word} `;
      y += lineHeight;
      lineCount += 1;
      if (lineCount >= maxLines - 1) {
        break;
      }
    } else {
      line = testLine;
    }
  }

  context.fillText(line.trim(), x, y);
}

function drawCard(payload: ExportPayload, variant: CardVariant) {
  const canvas = document.createElement("canvas");
  canvas.width = variant === "share" ? 1200 : 900;
  canvas.height = variant === "share" ? 630 : 760;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  const width = canvas.width;
  const height = canvas.height;
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#f8fafc");
  gradient.addColorStop(0.58, "#ecfeff");
  gradient.addColorStop(1, "#fff1f2");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(255,255,255,0.82)";
  roundedRect(context, 48, 48, width - 96, height - 96, 24);

  context.fillStyle = "#0f766e";
  context.font = "700 28px system-ui, sans-serif";
  context.fillText("Sort Playground", 88, 108);

  context.fillStyle = "#09090b";
  context.font = `800 ${variant === "share" ? 58 : 48}px system-ui, sans-serif`;
  context.fillText(`Algorithm: ${payload.algorithm.name}`, 88, variant === "share" ? 205 : 185);

  context.fillStyle = "#52525b";
  context.font = `600 ${variant === "share" ? 30 : 24}px ui-monospace, monospace`;
  context.fillText(`Complexity: ${payload.algorithm.complexity}`, 88, variant === "share" ? 260 : 235);

  const result = payload.result.join(" ");
  context.fillStyle = "#18181b";
  context.font = `700 ${variant === "share" ? 36 : 28}px ui-monospace, monospace`;
  context.fillText("Result:", 88, variant === "share" ? 335 : 315);
  context.font = `600 ${variant === "share" ? 34 : 26}px ui-monospace, monospace`;
  wrapText(context, result, 88, variant === "share" ? 385 : 360, width - 176, variant === "share" ? 46 : 38, 3);

  drawBars(context, payload.result, 88, variant === "share" ? 455 : 470, width - 176, variant === "share" ? 105 : 180);

  context.fillStyle = "#71717a";
  context.font = "600 20px system-ui, sans-serif";
  context.fillText("Explore · Visualize · Contribute", 88, height - 88);

  return canvas;
}

export function exportPng(payload: ExportPayload) {
  drawCard(payload, "result").toBlob((blob) => {
    if (blob) {
      triggerDownload(blob, `${payload.algorithm.slug}-result.png`);
    }
  }, "image/png");
}

export function exportShareCard(payload: ExportPayload) {
  drawCard(payload, "share").toBlob((blob) => {
    if (blob) {
      triggerDownload(blob, `${payload.algorithm.slug}-share-card.png`);
    }
  }, "image/png");
}

function drawGifFrame(values: number[], algorithm: Algorithm) {
  const canvas = document.createElement("canvas");
  canvas.width = 480;
  canvas.height = 320;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  context.fillStyle = "#fafafa";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#18181b";
  context.font = "700 20px system-ui, sans-serif";
  context.fillText("Sort Playground", 28, 42);
  context.fillStyle = "#52525b";
  context.font = "600 15px ui-monospace, monospace";
  context.fillText(algorithm.name, 28, 64);
  drawBars(context, values, 28, 88, canvas.width - 56, 180);
  context.fillStyle = "#71717a";
  context.font = "600 14px system-ui, sans-serif";
  context.fillText("Animated export", 28, 292);

  return canvas;
}

function sampleFrames(steps: Step[] | undefined, currentArray: number[]) {
  const arrays = steps?.map((step) => step.array) ?? [currentArray];

  if (arrays.length <= 18) {
    return arrays;
  }

  const maxFrames = 18;
  return Array.from({ length: maxFrames }, (_, index) => {
    const sourceIndex = Math.round((index / (maxFrames - 1)) * (arrays.length - 1));
    return arrays[sourceIndex];
  });
}

export function exportGif(payload: ExportPayload) {
  return new Promise<void>((resolve, reject) => {
    const frames = sampleFrames(payload.steps, payload.currentArray);
    const firstFrame = drawGifFrame(frames[0] ?? payload.currentArray, payload.algorithm);
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: firstFrame.width,
      height: firstFrame.height,
      workerScript: gifWorkerUrl,
      background: "#fafafa",
    });

    gif.on("finished", (blob: Blob) => {
      triggerDownload(blob, `${payload.algorithm.slug}-animation.gif`);
      resolve();
    });
    gif.on("abort", () => reject(new Error("GIF export was aborted.")));

    frames.forEach((values, index) => {
      const frameCanvas = index === 0 ? firstFrame : drawGifFrame(values, payload.algorithm);
      gif.addFrame(frameCanvas, { delay: 180, copy: true });
    });

    gif.render();
  });
}
