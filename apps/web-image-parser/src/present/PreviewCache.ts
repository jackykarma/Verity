import type { PresentViewModel } from '../shared/types/present.ts'

export interface CacheEntry {
  viewModel: PresentViewModel
  accessedAt: number
}

const MAX_ENTRIES = 3

export class PreviewCache {
  private entries = new Map<string, CacheEntry>()

  get(segmentId: string): CacheEntry | null {
    const entry = this.entries.get(segmentId)
    if (!entry) {
      return null
    }
    entry.accessedAt = Date.now()
    return entry
  }

  put(segmentId: string, viewModel: PresentViewModel): void {
    this.evictLru(segmentId)
    this.entries.set(segmentId, { viewModel, accessedAt: Date.now() })
    if (this.entries.size > MAX_ENTRIES) {
      this.evictLru(segmentId)
    }
  }

  evictLru(exceptSegmentId: string): void {
    if (this.entries.size <= MAX_ENTRIES) {
      return
    }
    let oldestId: string | null = null
    let oldestTime = Infinity
    for (const [id, entry] of this.entries) {
      if (id === exceptSegmentId) {
        continue
      }
      if (entry.accessedAt < oldestTime) {
        oldestTime = entry.accessedAt
        oldestId = id
      }
    }
    if (oldestId) {
      this.entries.delete(oldestId)
    }
  }

  clear(): void {
    this.entries.clear()
  }
}
