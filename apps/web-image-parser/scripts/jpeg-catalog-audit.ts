import { resolve } from 'node:path'
import { auditJpegCatalog, printAuditResult } from '../src/format-jpeg/jpegCatalogAudit.ts'

const ASSETS_DIR = resolve(
  import.meta.dirname,
  '../../../specs/epics/EPIC-005-web-image-parser/test-assets/jpeg',
)

const result = await auditJpegCatalog(ASSETS_DIR)
printAuditResult(result)
if (result.pct < 95) {
  process.exitCode = 1
}
