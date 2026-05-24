import { resolve } from 'node:path'

/** OPPO Find X9 Ultra grid HEIC (3072×4096, 48 tiles) — local test asset. */
export const HEIC_GRID_SAMPLE = resolve(
  import.meta.dirname,
  '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/heic/IMG20260524112828.heic',
)
