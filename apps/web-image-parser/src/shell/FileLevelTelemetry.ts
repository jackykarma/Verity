import type { FileFailureType } from '../shared/types/errors.ts'
import type { ParsePhase } from '../shared/types/session.ts'

export interface FileLevelTelemetryEvent {
  phase: ParsePhase
  failureType: FileFailureType | null
  format: 'jpeg' | 'heic' | null
  durationMs: number
  fileName: string | null
}

const listeners = new Set<(event: FileLevelTelemetryEvent) => void>()

export function onFileLevelTelemetry(handler: (event: FileLevelTelemetryEvent) => void): () => void {
  listeners.add(handler)
  return () => listeners.delete(handler)
}

export function emitFileLevelTelemetry(event: FileLevelTelemetryEvent): void {
  if (import.meta.env.DEV) {
    console.debug(
      '[FileLevelTelemetry]',
      event.phase,
      event.format,
      event.failureType,
      `${event.durationMs}ms`,
    )
  }
  for (const listener of listeners) {
    listener(event)
  }
}
