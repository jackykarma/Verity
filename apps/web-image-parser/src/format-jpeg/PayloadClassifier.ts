import type { PayloadKind } from '../shared/types/present.ts'
import { isUnknownCatalog, PAR_ENTROPY_DATA } from './segmentCatalog.ts'

export function classifyPayload(parCatalogId: string, marker: number): PayloadKind {
  if (parCatalogId === PAR_ENTROPY_DATA.parCatalogId) {
    return 'image'
  }
  if (parCatalogId === 'PAR-JPEG-024') {
    return 'video'
  }
  if (parCatalogId === 'PAR-JPEG-025') {
    return 'image'
  }
  if (parCatalogId === 'PAR-JPEG-019') {
    return 'mixed'
  }

  const metadataIds = new Set([
    'PAR-JPEG-001',
    'PAR-JPEG-002',
    'PAR-JPEG-003',
    'PAR-JPEG-004',
    'PAR-JPEG-005',
    'PAR-JPEG-006',
    'PAR-JPEG-007',
    'PAR-JPEG-008',
    'PAR-JPEG-009',
    'PAR-JPEG-010',
    'PAR-JPEG-013',
    'PAR-JPEG-014',
    'PAR-JPEG-016',
    'PAR-JPEG-017',
    'PAR-JPEG-021',
    'PAR-JPEG-022',
    'PAR-JPEG-026',
  ])

  if (metadataIds.has(parCatalogId)) {
    return 'metadata'
  }

  if (parCatalogId === 'PAR-JPEG-011' || parCatalogId === 'PAR-JPEG-012') {
    return 'other'
  }

  if (isUnknownCatalog(parCatalogId)) {
    return 'other'
  }

  if (marker >= 0xe0 && marker <= 0xef) {
    return 'metadata'
  }

  return 'other'
}
