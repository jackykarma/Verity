/** 文件级失败类型（FEAT-001 / tech-spec §三） */
export type FileFailureType =
  | 'UNSUPPORTED_TYPE'
  | 'FILE_TOO_LARGE'
  | 'PERMISSION_DENIED'
  | 'READ_FAILED'
  | 'PARSE_TIMEOUT'
  | 'PARSE_FAILED'
  | 'PARSE_PARTIAL'
  | 'CANCELLED'
  | 'UNKNOWN'

/** 分区级失败类型 */
export type SegmentFailureType =
  | 'SEGMENT_WARNING'
  | 'SEGMENT_UNREADABLE'
  | 'ENV_UNSUPPORTED'
  | 'PRESENT_PREVIEW_FAILED'
  | 'PRESENT_PLAYBACK_FAILED'

export type FailureType = FileFailureType | SegmentFailureType

export const FILE_FAILURE_MESSAGES: Record<FileFailureType, string> = {
  UNSUPPORTED_TYPE: '不支持的文件类型，请选择 JPEG 或 HEIC 图片',
  FILE_TOO_LARGE: '文件超过 50MB 上限',
  PERMISSION_DENIED: '无法读取文件，请重新选择',
  READ_FAILED: '文件读取失败，请重试',
  PARSE_TIMEOUT: '解析超时（120 秒），请重试或选择较小文件',
  PARSE_FAILED: '解析失败，文件可能已损坏',
  PARSE_PARTIAL: '部分分区解析成功，部分分区无法读取',
  CANCELLED: '解析已取消',
  UNKNOWN: '发生未知错误',
}
