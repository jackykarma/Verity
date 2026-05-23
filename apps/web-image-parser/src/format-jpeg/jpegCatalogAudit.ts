import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parseJpegBuffer } from './JpegParser.ts'

/** FEAT-002 spec §解析内容目录 — P1 目录项 */
export const P1_CATALOG_IDS = [
  'PAR-JPEG-006',
  'PAR-JPEG-007',
  'PAR-JPEG-008',
  'PAR-JPEG-009',
  'PAR-JPEG-012',
  'PAR-JPEG-016',
  'PAR-JPEG-017',
  'PAR-JPEG-019',
  'PAR-JPEG-020',
  'PAR-JPEG-021',
  'PAR-JPEG-022',
  'PAR-JPEG-024',
  'PAR-JPEG-026',
  'PAR-JPEG-027',
  'PAR-JPEG-028',
  'PAR-JPEG-C02',
  'PAR-JPEG-C03',
  'PAR-JPEG-C04',
] as const

/** 无样例或尚未实现 — 不计入分母（LIM 登记） */
export const KNOWN_LIMITATIONS = new Set<string>([
  'PAR-JPEG-007',
  'PAR-JPEG-008',
  'PAR-JPEG-009',
  'PAR-JPEG-017',
  'PAR-JPEG-019',
  'PAR-JPEG-020',
  'PAR-JPEG-022',
  'PAR-JPEG-024',
  'PAR-JPEG-027',
  'PAR-JPEG-028',
  'PAR-JPEG-C02',
  'PAR-JPEG-C03',
  'PAR-JPEG-C04',
])

export interface AuditResult {
  fileCount: number
  inScope: string[]
  covered: string[]
  missing: string[]
  pct: number
}

export async function auditJpegCatalog(assetsDir: string): Promise<AuditResult> {
  const files = readdirSync(assetsDir).filter((f) => /\.jpe?g$/i.test(f))
  const observed = new Set<string>()

  for (const file of files) {
    const buf = readFileSync(join(assetsDir, file))
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
    const result = await parseJpegBuffer(ab)
    for (const node of result.tree?.nodes ?? []) {
      observed.add(node.parCatalogId)
    }
  }

  const inScope = P1_CATALOG_IDS.filter((id) => !KNOWN_LIMITATIONS.has(id))
  const covered = inScope.filter((id) => observed.has(id))
  const missing = inScope.filter((id) => !observed.has(id))
  const pct = inScope.length === 0 ? 100 : Math.round((covered.length / inScope.length) * 100)

  return { fileCount: files.length, inScope: [...inScope], covered, missing, pct }
}

export function printAuditResult(result: AuditResult): void {
  console.log('JPEG P1 目录覆盖率自检')
  console.log(`样例文件: ${result.fileCount} 个`)
  console.log(`分母 (P1 − 已知限制): ${result.inScope.length}`)
  console.log(`已覆盖: ${result.covered.length} (${result.pct}%)`)
  console.log('已覆盖 ID:', result.covered.join(', ') || '（无）')
  if (result.missing.length > 0) {
    console.log('未覆盖 ID:', result.missing.join(', '))
  }
  if (KNOWN_LIMITATIONS.size > 0) {
    console.log('已知限制 (不计分):', [...KNOWN_LIMITATIONS].join(', '))
  }

  if (result.pct < 95) {
    console.error(`\n❌ 覆盖率 ${result.pct}% 低于 95% 门槛`)
  } else {
    console.log(`\n✅ 覆盖率 ${result.pct}% ≥ 95%`)
  }
}
