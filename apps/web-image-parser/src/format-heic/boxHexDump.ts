import { formatByteOffset } from '../shared/formatUtils.ts'

export interface HexDumpOptions {
  /** 最多转储字节数；默认按 box 大小自适应 */
  maxBytes?: number
  /** 每行字节数 */
  bytesPerLine?: number
}

const SMALL_BOX_FULL = 4096
const MEDIUM_BOX_CAP = 512
const LARGE_BOX_CAP = 256

export function hexDumpAt(
  buffer: ArrayBuffer,
  offset: number,
  length: number,
  options: HexDumpOptions = {},
): string {
  if (length <= 0) {
    return '（无数据）'
  }

  const maxBytes =
    options.maxBytes ??
    (length <= SMALL_BOX_FULL ? length : length <= 65536 ? MEDIUM_BOX_CAP : LARGE_BOX_CAP)

  const cap = Math.min(length, maxBytes)
  const bytes = new Uint8Array(buffer, offset, cap)
  const perLine = options.bytesPerLine ?? 16
  const lines: string[] = []

  for (let i = 0; i < bytes.length; i += perLine) {
    const chunk = bytes.subarray(i, Math.min(i + perLine, bytes.length))
    const hex = [...chunk].map((b) => b.toString(16).padStart(2, '0')).join(' ')
    const ascii = [...chunk]
      .map((b) => (b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.'))
      .join('')
    const addr = formatByteOffset(offset + i)
    lines.push(`${addr}  ${hex.padEnd(perLine * 3 - 1, ' ')}  ${ascii}`)
  }

  if (length > cap) {
    lines.push(`… 共 ${length.toLocaleString()} 字节 @ ${formatByteOffset(offset)}，已显示前 ${cap} 字节`)
  }

  return lines.join('\n')
}
