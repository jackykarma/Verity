import { useCallback, useRef } from 'react'
import type { FileFailureType } from '../../shared/types/errors.ts'
import { ingestService } from '../IngestService.ts'
import { parseOrchestrator } from '../ParseOrchestrator.ts'

interface FileIngestZoneProps {
  disabled?: boolean
  onError?: (failureType: FileFailureType, message: string) => void
}

export function FileIngestZone({ disabled, onError }: FileIngestZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const outcome = await ingestService.ingestFromFileList(files)
      if (!outcome.ok || !outcome.file) {
        if (outcome.failureType && outcome.message) {
          onError?.(outcome.failureType, outcome.message)
        }
        return
      }
      await parseOrchestrator.startParse(outcome.file)
    },
    [onError],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (disabled) {
        return
      }
      void handleFiles(e.dataTransfer.files)
    },
    [disabled, handleFiles],
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        void handleFiles(e.target.files)
      }
      e.target.value = ''
    },
    [handleFiles],
  )

  return (
    <div
      className="ingest-zone"
      data-testid="ingest-zone"
      onDrop={onDrop}
      onDragOver={onDragOver}
      data-disabled={disabled ? 'true' : 'false'}
    >
      <p>拖放 JPEG / HEIC 文件到此处，或</p>
      <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()}>
        选择文件
      </button>
      <input
        ref={inputRef}
        data-testid="file-input"
        type="file"
        accept=".jpg,.jpeg,.heic,.heif,image/jpeg,image/heic"
        hidden
        onChange={onInputChange}
      />
    </div>
  )
}
