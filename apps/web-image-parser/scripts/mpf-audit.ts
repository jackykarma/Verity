/**
 * 对比本工程 MPF/XMP Container 解析与原始 MP Entry 十六进制。
 * 用法: npx tsx scripts/mpf-audit.ts <path-to.jpg>
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  buildMpfReadable,
  parseMpfSegment,
  type MpfImageEntry,
} from '../src/format-jpeg/MpfParser.ts'
import {
  findXmpContainerInBuffer,
  findXmpXmlInBuffer,
  parseXmpContainerItems,
  patchMotionPhotoLengthFromXml,
  resolveContainerItemOffsets,
} from '../src/format-jpeg/XmpContainer.ts'
import { buildContainerReadable } from '../src/format-jpeg/XmpContainer.ts'

const filePath = resolve(process.argv[2] ?? '')
if (!filePath) {
  console.error('Usage: npx tsx scripts/mpf-audit.ts <jpg>')
  process.exit(1)
}

const buffer = readFileSync(filePath).buffer
const data = new Uint8Array(buffer)

function findMpfSegment(): { offset: number; length: number } | null {
  for (let i = 0; i + 4 < data.length; i++) {
    if (data[i] !== 0xff || data[i + 1] !== 0xe2) continue
    const segLen = (data[i + 2]! << 8) | data[i + 3]!
    if (segLen < 4 || i + 2 + segLen > data.length) continue
    const p = i + 4
    if (
      data[p] === 0x4d &&
      data[p + 1] === 0x50 &&
      data[p + 2] === 0x46 &&
      data[p + 3] === 0
    ) {
      return { offset: i, length: 2 + segLen }
    }
  }
  return null
}

function readU32Le(o: number): number {
  return data[o]! | (data[o + 1]! << 8) | (data[o + 2]! << 16) | (data[o + 3]! << 24)
}

function dumpRawMpEntries(segOffset: number, segLength: number): void {
  const payloadStart = segOffset + 4
  let mpfOffset = -1
  for (let i = payloadStart; i <= segOffset + segLength - 4; i++) {
    if (data[i] === 0x4d && data[i + 1] === 0x50 && data[i + 2] === 0x46 && data[i + 3] === 0) {
      mpfOffset = i
      break
    }
  }
  if (mpfOffset < 0) {
    console.log('No MPF signature found')
    return
  }

  const tiffStart = mpfOffset + 4
  const le = data[tiffStart] === 0x49
  const read32 = (o: number) =>
    le
      ? data[o]! | (data[o + 1]! << 8) | (data[o + 2]! << 16) | (data[o + 3]! << 24)
      : (data[o]! << 24) | (data[o + 1]! << 16) | (data[o + 2]! << 8) | data[o + 3]!
  const read16 = (o: number) => (le ? data[o]! | (data[o + 1]! << 8) : (data[o]! << 8) | data[o + 1]!)

  const ifdRel = read32(tiffStart + 4)
  const ifdOffset = tiffStart + ifdRel
  const count = read16(ifdOffset)

  console.log('\n=== Raw MPF IFD ===')
  console.log(`TIFF ${le ? 'LE' : 'BE'} @ ${tiffStart}, IFD tags: ${count}`)

  for (let t = 0; t < count; t++) {
    const e = ifdOffset + 2 + t * 12
    const tag = read16(e)
    const type = read16(e + 2)
    const cnt = read32(e + 4)
    const vo = read32(e + 8)
    console.log(
      `  Tag 0x${tag.toString(16)} type=${type} count=${cnt} value/offset=${vo} (0x${vo.toString(16)})`,
    )

    if (tag === 0xb002 && type === 7) {
      const dataOffset = cnt <= 4 ? e + 8 : tiffStart + vo
      const n = Math.floor(cnt / 16)
      console.log(`\n=== Raw MP Entry bytes (${n} x 16) @ ${dataOffset} ===`)
      for (let j = 0; j < n; j++) {
        const base = dataOffset + j * 16
        const attr = read32(base)
        const size = read32(base + 4)
        const offset = read32(base + 8)
        const dep1 = read16(base + 12)
        const dep2 = read16(base + 14)
        const hex = Array.from(data.slice(base, base + 16))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ')
        console.log(
          `  [${j}] attr=0x${attr.toString(16)} size=${size} (0x${size.toString(16)}) offset=${offset} (0x${offset.toString(16)}) dep=${dep1},${dep2}`,
        )
        console.log(`       hex: ${hex}`)
        const soiAtOffset = data[offset] === 0xff && data[offset + 1] === 0xd8
        console.log(`       SOI @ offset: ${soiAtOffset ? 'YES' : 'NO'}`)
      }
    }
  }
}

function printEntry(label: string, entry: MpfImageEntry): void {
  console.log(
    `  ${label}: type=0x${entry.imageType.toString(16)} (${entry.imageTypeLabel}) start=${entry.offset} len=${entry.size} xmpOff=${entry.xmpOffset ?? '—'} xmpLen=${entry.xmpLength ?? '—'}`,
  )
}

const seg = findMpfSegment()
console.log(`File: ${filePath}`)
console.log(`Size: ${data.length} bytes (0x${data.length.toString(16)})`)

if (seg) {
  dumpRawMpEntries(seg.offset, seg.length)
  const mpf = parseMpfSegment(buffer, seg.offset, seg.length)
  console.log('\n=== Our parseMpfSegment ===')
  if (!mpf) {
    console.log('parse failed')
  } else {
    console.log(`NumberOfImages: ${mpf.numberOfImages}`)
    mpf.entries.forEach((e, i) => printEntry(`MPImage ${i + 1}`, e))
    console.log('\n=== Our buildMpfReadable (selected) ===')
    const readable = buildMpfReadable(mpf)
    for (const f of readable.fields) {
      if (
        f.key.includes('MPImage') ||
        f.key.includes('NumberOfImages') ||
        f.key.includes('区间') ||
        f.key.includes('XMP')
      ) {
        console.log(`  ${f.key}: ${f.value}`)
      }
    }
  }
}

const xmpXml = findXmpXmlInBuffer(buffer)
if (xmpXml) {
  let items = parseXmpContainerItems(xmpXml)
  items = patchMotionPhotoLengthFromXml(items, xmpXml)
  const resolved = resolveContainerItemOffsets(data.length, items)
  console.log('\n=== XMP Container ===')
  for (const f of buildContainerReadable(resolved)) {
    console.log(`  ${f.key}: ${f.value}`)
  }
}
