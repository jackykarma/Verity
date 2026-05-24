import type { ParseStatus } from '../shared/types/session.ts'
import type { HeicEnvReport } from './HeicEnvDetector.ts'

export type HeicFailureKind = 'unsupported_env' | 'corrupted' | 'truncated' | 'none'

export interface HeicFailureReport {
  kind: HeicFailureKind
  userMessage: string
}

export function classifyHeicParseOutcome(
  status: ParseStatus,
  truncated: boolean,
  env: HeicEnvReport,
  boxCount: number,
  warnings: string[] = [],
): HeicFailureReport {
  if (boxCount === 0) {
    return {
      kind: 'corrupted',
      userMessage: '文件已损坏或非 HEIC/HEIF 容器，无法识别 BMFF 结构',
    }
  }

  if (truncated || status === 'partial') {
    return {
      kind: 'truncated',
      userMessage: '文件不完整或 mdat 截断，已展示可解析部分',
    }
  }

  const vendorTail = warnings.some((w) => w.includes('非文件截断'))
  if (vendorTail) {
    if (env.level === 'C') {
      return {
        kind: 'unsupported_env',
        userMessage: `${env.message}；结构树已完整解析（含厂商扩展尾部）`,
      }
    }
    return { kind: 'none', userMessage: '' }
  }

  if (env.level === 'C' && status === 'success') {
    return {
      kind: 'unsupported_env',
      userMessage: `${env.message}；结构树可读，图像/视频预览可能不可用`,
    }
  }

  return { kind: 'none', userMessage: '' }
}
