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

export async function benchmarkIterations({ runner, datasetPath }) {
  for (let index = 0; index < WARMUP_RUNS; index += 1) {
    await runner.measure(datasetPath);
  }

  const durations = [];

  for (let index = 0; index < MEASURED_RUNS; index += 1) {
    const measurement = await runner.measure(datasetPath);
    durations.push(measurement.durationMs);
  }

  return {
    warmupRuns: WARMUP_RUNS,
    measuredRuns: MEASURED_RUNS,
    averageMs: roundMetric(average(durations) ?? 0),
  };
}
