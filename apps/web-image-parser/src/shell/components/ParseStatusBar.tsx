import type { ParsePhase } from '../../shared/types/session.ts'
import { FILE_FAILURE_MESSAGES } from '../../shared/types/errors.ts'
import type { FileFailureType } from '../../shared/types/errors.ts'

const PHASE_LABEL: Record<ParsePhase, string> = {
  idle: '等待文件',
  validating: '校验中…',
  parsing: '解析中…',
  success: '解析完成',
  partial: '部分成功',
  failed: '解析失败',
  cancelled: '已取消',
}

interface ParseStatusBarProps {
  phase: ParsePhase
  fileName: string | null
  failureType: FileFailureType | null
  message: string
  onCancel?: () => void
  onReset?: () => void
}

export function ParseStatusBar({
  phase,
  fileName,
  failureType,
  message,
  onCancel,
  onReset,
}: ParseStatusBarProps) {
  const displayMessage =
    message || (failureType ? FILE_FAILURE_MESSAGES[failureType] : '') || PHASE_LABEL[phase]

  return (
    <div className="parse-status" data-testid="parse-status">
      <span className="parse-status__phase" data-testid="parse-phase">{PHASE_LABEL[phase]}</span>
      {fileName ? <span className="parse-status__file">{fileName}</span> : null}
      <span className="parse-status__message">{displayMessage}</span>
      {phase === 'parsing' ? (
        <button type="button" onClick={onCancel}>
          取消解析
        </button>
      ) : null}
      {phase !== 'idle' && phase !== 'parsing' && phase !== 'validating' ? (
        <button type="button" onClick={onReset}>
          清除
        </button>
      ) : null}
    </div>
  )
}
