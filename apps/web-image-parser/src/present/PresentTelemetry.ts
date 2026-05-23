import type { PresentFailureKind } from '../shared/types/present.ts'

export interface PresentTelemetryEvent {
  segmentId: string
  failureKind: PresentFailureKind | null
  status: 'success' | 'failed' | 'degraded'
  durationMs: number
}

const listeners = new Set<(event: PresentTelemetryEvent) => void>()

export function onPresentTelemetry(handler: (event: PresentTelemetryEvent) => void): () => void {
  listeners.add(handler)
  return () => listeners.delete(handler)
}

export function emitPresentTelemetry(event: PresentTelemetryEvent): void {
  if (import.meta.env.DEV) {
    console.debug('[PresentTelemetry]', event.segmentId, event.status, event.failureKind, `${event.durationMs}ms`)
  }
  for (const listener of listeners) {
    listener(event)
  }
}
