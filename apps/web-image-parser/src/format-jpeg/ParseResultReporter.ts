import type { SegmentTreeDto } from '../shared/types/parseMessages.ts'
import type { FileFailureType } from '../shared/types/errors.ts'
import type { ParsePhase, ParseStatus } from '../shared/types/session.ts'

export interface ParseReport {
  phase: ParsePhase
  status: ParseStatus | null
  failureType: FileFailureType | null
  treeNodeCount: number
  warningCount: number
  message: string
}

export function buildParseReport(
  phase: ParsePhase,
  tree: SegmentTreeDto | null,
  failureType: FileFailureType | null,
  message: string,
): ParseReport {
  return {
    phase,
    status: phaseToStatus(phase),
    failureType,
    treeNodeCount: tree?.nodes.length ?? 0,
    warningCount: tree?.warnings.length ?? 0,
    message,
  }
}

function phaseToStatus(phase: ParsePhase): ParseStatus | null {
  switch (phase) {
    case 'success':
      return 'success'
    case 'partial':
      return 'partial'
    case 'failed':
      return 'failed'
    case 'cancelled':
      return 'cancelled'
    default:
      return null
  }
}

export function summarizeTreeHealth(tree: SegmentTreeDto | null): string {
  if (!tree) {
    return '无解析树'
  }
  if (tree.warnings.length > 0) {
    return `部分成功（${tree.warnings.length} 条警告）`
  }
  return `解析成功（${tree.nodes.length} 个节点）`
}
