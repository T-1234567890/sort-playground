import type { Algorithm, Step } from "./types";

export type ExportPayload = {
  algorithm: Algorithm;
  result: number[];
  currentArray: number[];
  steps?: Step[];
};

type CardVariant = "result" | "share";

const palette = [
  [250, 250, 250],
  [24, 24, 27],
  [161, 161, 170],
  [20, 184, 166],
  [251, 191, 36],
  [244, 63, 94],
  [52, 211, 153],
  [228, 228, 231],
] as const;

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

function drawGifFrame(values: number[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 480;
  canvas.height = 320;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  context.fillStyle = "#fafafa";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#18181b";
  context.font = "700 20px system-ui, sans-serif";
  context.fillText("Sort Playground", 28, 42);
  drawBars(context, values, 28, 76, canvas.width - 56, 190);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function nearestPaletteIndex(r: number, g: number, b: number) {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  palette.forEach((color, index) => {
    const distance = (r - color[0]) ** 2 + (g - color[1]) ** 2 + (b - color[2]) ** 2;
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });

  return best;
}

function imageDataToIndexes(imageData: ImageData) {
  const indexes = new Uint8Array(imageData.width * imageData.height);
  for (let source = 0, target = 0; source < imageData.data.length; source += 4, target += 1) {
    indexes[target] = nearestPaletteIndex(imageData.data[source], imageData.data[source + 1], imageData.data[source + 2]);
  }
  return indexes;
}

function writeShort(bytes: number[], value: number) {
  bytes.push(value & 0xff, (value >> 8) & 0xff);
}

function writeString(bytes: number[], value: string) {
  for (let index = 0; index < value.length; index += 1) {
    bytes.push(value.charCodeAt(index));
  }
}

function lzwEncode(indexes: Uint8Array, minCodeSize = 3) {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = endCode + 1;
  const dictionary = new Map<string, number>();
  const output: number[] = [];
  let bitBuffer = 0;
  let bitCount = 0;

  function resetDictionary() {
    dictionary.clear();
    for (let index = 0; index < clearCode; index += 1) {
      dictionary.set(`${index}`, index);
    }
    codeSize = minCodeSize + 1;
    nextCode = endCode + 1;
  }

  function writeCode(code: number) {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      output.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  }

  resetDictionary();
  writeCode(clearCode);
  let phrase = `${indexes[0]}`;

  for (let index = 1; index < indexes.length; index += 1) {
    const current = indexes[index];
    const nextPhrase = `${phrase},${current}`;

    if (dictionary.has(nextPhrase)) {
      phrase = nextPhrase;
    } else {
      writeCode(dictionary.get(phrase)!);
      if (nextCode < 4096) {
        dictionary.set(nextPhrase, nextCode);
        nextCode += 1;
        if (nextCode === 1 << codeSize && codeSize < 12) {
          codeSize += 1;
        }
      } else {
        writeCode(clearCode);
        resetDictionary();
      }
      phrase = `${current}`;
    }
  }

  writeCode(dictionary.get(phrase)!);
  writeCode(endCode);

  if (bitCount > 0) {
    output.push(bitBuffer & 0xff);
  }

  return output;
}

function writeSubBlocks(bytes: number[], data: number[]) {
  for (let index = 0; index < data.length; index += 255) {
    const chunk = data.slice(index, index + 255);
    bytes.push(chunk.length, ...chunk);
  }
  bytes.push(0);
}

export function exportGif(payload: ExportPayload) {
  const frames = (payload.steps?.length ? payload.steps : [{ array: payload.currentArray } as Step]);
  const sampledFrames = frames.filter((_, index) => index % Math.max(1, Math.ceil(frames.length / 28)) === 0).slice(0, 28);
  const width = 480;
  const height = 320;
  const bytes: number[] = [];

  writeString(bytes, "GIF89a");
  writeShort(bytes, width);
  writeShort(bytes, height);
  bytes.push(0xf2, 0, 0);
  palette.forEach((color) => bytes.push(...color));
  writeString(bytes, "!\xff\x0bNETSCAPE2.0\x03\x01");
  writeShort(bytes, 0);
  bytes.push(0);

  sampledFrames.forEach((frame) => {
    const imageData = drawGifFrame(frame.array);
    const indexes = imageDataToIndexes(imageData);
    bytes.push(0x21, 0xf9, 0x04, 0x00);
    writeShort(bytes, 8);
    bytes.push(0, 0x2c);
    writeShort(bytes, 0);
    writeShort(bytes, 0);
    writeShort(bytes, width);
    writeShort(bytes, height);
    bytes.push(0, 3);
    writeSubBlocks(bytes, lzwEncode(indexes));
  });

  bytes.push(0x3b);
  triggerDownload(new Blob([new Uint8Array(bytes)], { type: "image/gif" }), `${payload.algorithm.slug}-animation.gif`);
}
