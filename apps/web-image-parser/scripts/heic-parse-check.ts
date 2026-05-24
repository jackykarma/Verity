import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseHeicBuffer } from '../src/format-heic/HeicParser.ts'
import { parseBmffBoxes } from '../src/format-heic/BmffReader.ts'

const fileArg = process.argv[2]
if (!fileArg) {
  console.error('Usage: vite-node scripts/heic-parse-check.ts <path-to.heic>')
  process.exit(1)
}

const path = resolve(fileArg)
const buf = readFileSync(path)
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)

console.log('File:', path)
console.log('Size:', buf.length, 'bytes')

const { boxes, truncated, vendorTailBytes, warnings } = parseBmffBoxes(ab)
console.log('\n=== BMFF Top-level boxes ===')
console.log('Truncated:', truncated)
console.log('Vendor tail bytes:', vendorTailBytes)
console.log(
  'Top-level types:',
  boxes.filter((b) => !b.parent).map((b) => `${b.type}(${b.size})`).join(', '),
)
console.log('Total boxes:', boxes.length)
if (warnings.length) console.log('Warnings:', warnings)

const result = parseHeicBuffer(ab)
console.log('\n=== Parse Result ===')
console.log('Status:', result.status)
console.log('Message:', result.message)
console.log('Tree nodes:', result.tree?.nodes.length ?? 0)
console.log('Tree warnings:', result.tree?.warnings?.length ?? 0)

if (result.tree) {
  const byPar = new Map<string, number>()
  for (const n of result.tree.nodes) {
    const k = n.parCatalogId || 'none'
    byPar.set(k, (byPar.get(k) || 0) + 1)
  }
  console.log('\n=== PAR Catalog Coverage ===')
  for (const [k, v] of [...byPar.entries()].sort()) console.log(' ', k, ':', v)

  console.log('\n=== Tree Nodes ===')
  for (const n of result.tree.nodes) {
    const indent = '  '.repeat(n.depth ?? 0)
    console.log(
      `${indent}- [${n.parCatalogId}] ${n.label}${n.loadType ? ` (${n.loadType})` : ''}`,
    )
  }

  console.log('\n=== Key PAR nodes ===')
  const keys = [
    'PAR-HEIC-001',
    'PAR-HEIC-002',
    'PAR-HEIC-004',
    'PAR-HEIC-005',
    'PAR-HEIC-006',
    'PAR-HEIC-101',
    'PAR-HEIC-102',
    'PAR-HEIC-201',
    'PAR-HEIC-302',
    'PAR-HEIC-099',
  ]
  for (const k of keys) {
    const found = result.tree.nodes.filter((n) => n.parCatalogId === k)
    if (found.length) console.log(`${k}:`, found.map((n) => n.label).join(' | '))
    else console.log(`${k}: MISSING`)
  }

  if (result.tree.warnings?.length) {
    console.log('\n=== Tree Warnings ===')
    for (const w of result.tree.warnings) console.log('-', w)
  }
}

if (result.status === 'failed') process.exitCode = 1
