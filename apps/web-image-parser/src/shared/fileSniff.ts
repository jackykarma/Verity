import type { FileFormat } from './types/session.ts'

const JPEG_MAGIC = [0xff, 0xd8, 0xff] as const
const HEIC_FTYP_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1', 'avif'])

export interface SniffResult {
  format: FileFormat | null
  reason?: string
}

export function sniffFormat(buffer: ArrayBuffer, fileName: string): SniffResult {
  const bytes = new Uint8Array(buffer)
  if (bytes.length >= 3 && JPEG_MAGIC.every((b, i) => bytes[i] === b)) {
    return { format: 'jpeg' }
  }

  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'jpg' || ext === 'jpeg') {
    return { format: 'jpeg' }
  }

  if (bytes.length >= 12) {
    const brand = String.fromCharCode(bytes[8]!, bytes[9]!, bytes[10]!, bytes[11]!)
    const ftyp = String.fromCharCode(bytes[4]!, bytes[5]!, bytes[6]!, bytes[7]!)
    if (ftyp === 'ftyp' && HEIC_FTYP_BRANDS.has(brand)) {
      return { format: 'heic' }
    }
  }

  if (ext === 'heic' || ext === 'heif') {
    return { format: 'heic' }
  }

  return { format: null, reason: 'unsupported magic or extension' }
}

export function isSupportedFormat(format: FileFormat | null): format is FileFormat {
  return format === 'jpeg' || format === 'heic'
}
