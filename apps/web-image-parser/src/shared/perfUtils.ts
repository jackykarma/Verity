export function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    return 0
  }
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)
  return sorted[idx] ?? 0
}

export function summarizeDurations(values: number[]): { p50: number; p95: number; max: number } {
  return {
    p50: percentile(values, 50),
    p95: percentile(values, 95),
    max: Math.max(...values, 0),
  }
}
