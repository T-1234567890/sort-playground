export const WARMUP_RUNS = 5;
export const MEASURED_RUNS = 30;

export function average(numbers) {
  if (!numbers.length) {
    return undefined;
  }

  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

export function roundMetric(value, digits = 3) {
  return Number(value.toFixed(digits));
}

export async function benchmarkIterations({ runner, datasetPath, label }) {
  if (label) {
    console.log(`[benchmark] ${label}: warm-up (${WARMUP_RUNS} runs)`);
  }

  for (let index = 0; index < WARMUP_RUNS; index += 1) {
    await runner.measure(datasetPath);
  }

  const durations = [];

  if (label) {
    console.log(`[benchmark] ${label}: measured (${MEASURED_RUNS} runs)`);
  }

  for (let index = 0; index < MEASURED_RUNS; index += 1) {
    const measurement = await runner.measure(datasetPath);
    durations.push(measurement.durationMs);
  }

  const averageMs = roundMetric(average(durations) ?? 0);

  if (label) {
    console.log(`[benchmark] ${label}: complete (${averageMs} ms avg)`);
  }

  return {
    warmupRuns: WARMUP_RUNS,
    measuredRuns: MEASURED_RUNS,
    averageMs,
  };
}
