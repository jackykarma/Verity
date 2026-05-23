import type { FileFormat } from '../../shared/types/session.ts'

interface FormatSlotProps {
  format: FileFormat | null
}

const FORMAT_LABEL: Record<FileFormat, string> = {
  jpeg: 'JPEG 结构视图',
  heic: 'HEIC 结构视图',
}

export function FormatSlot({ format }: FormatSlotProps) {
  if (!format) {
    return null
  }

  return (
    <div className="format-slot" data-format={format} data-testid="format-slot">
      当前格式：<strong>{FORMAT_LABEL[format]}</strong>
    </div>
  )
}
