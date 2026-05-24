/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'
import {
  boxRoleSummary,
  explainFtypBrand,
  explainItemType,
  HEIF_RENDER_PIPELINE,
} from '../heifBoxHelp.ts'

describe('heifBoxHelp', () => {
  it('explains heic brand per wiki', () => {
    expect(explainFtypBrand('heic')).toContain('HEVC')
    expect(explainFtypBrand('mif1')).toContain('Multi-Image')
  })

  it('explains Exif item type', () => {
    expect(explainItemType('Exif')).toContain('EXIF')
  })

  it('provides meta box role summary', () => {
    expect(boxRoleSummary('meta')).toContain('iloc')
  })

  it('defines render pipeline steps', () => {
    expect(HEIF_RENDER_PIPELINE.length).toBeGreaterThanOrEqual(6)
    expect(HEIF_RENDER_PIPELINE[0]).toContain('ftyp')
  })
})
