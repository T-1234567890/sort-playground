export function isSorted(values) {
  for (let index = 1; index < values.length; index += 1) {
    if (values[index - 1] > values[index]) {
      return false;
    }
  }

  return true;
}

export function assertSorted(values, context) {
  if (!Array.isArray(values) || !isSorted(values)) {
    throw new Error(`Benchmark output was not sorted for ${context}.`);
  }
}

export function assertIdenticalResults(resultMap, context) {
  const serialized = Object.entries(resultMap).map(([language, values]) => [language, JSON.stringify(values)]);
  const reference = serialized[0]?.[1];

  for (const [language, value] of serialized) {
    if (value !== reference) {
      throw new Error(`Benchmark output mismatch for ${context}: ${language} diverged from the reference result.`);
    }
  }
}
