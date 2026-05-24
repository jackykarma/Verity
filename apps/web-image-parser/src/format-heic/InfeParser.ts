import type { ReadableField } from '../shared/types/present.ts'
import { explainItemType } from './heifBoxHelp.ts'

export interface InfeEntry {
  version: number
  flags: number
  itemId: number
  itemProtectionIndex: number
  itemType: string
  itemName: string
  contentType?: string
  contentEncoding?: string
  boxOffset: number
  boxSize: number
}

export interface IinfHeader {
  version: number
  flags: number
  entryCount: number
  entryCountWidth: 2 | 4
}

function readCString(data: Uint8Array, start: number, end: number): { value: string; next: number } {
  let i = start
  while (i < end && data[i] !== 0) {
    i++
  }
  const value = new TextDecoder('utf-8', { fatal: false }).decode(data.subarray(start, i))
  return { value, next: Math.min(i + 1, end) }
}

export function parseIinfHeader(data: Uint8Array, offset: number, size: number): IinfHeader | null {
  if (size < 14) {
    return null
  }
  const version = data[offset + 8]!
  const flags =
    (data[offset + 9]! << 16) | (data[offset + 10]! << 8) | data[offset + 11]!
  const pos = offset + 12
  if (version === 0) {
    if (pos + 2 > offset + size) {
      return null
    }
    return {
      version,
      flags,
      entryCount: (data[pos]! << 8) | data[pos + 1]!,
      entryCountWidth: 2,
    }
  }
  if (pos + 4 > offset + size) {
    return null
  }
  const entryCount =
    ((data[pos]! << 24) | (data[pos + 1]! << 16) | (data[pos + 2]! << 8) | data[pos + 3]!) >>> 0
  return { version, flags, entryCount, entryCountWidth: 4 }
}

/** 解析 infe（Item Information Entry），HEIF/MIAF 以 version=2 为主 */
export function parseInfeBox(data: Uint8Array, offset: number, size: number): InfeEntry | null {
  if (size < 12) {
    return null
  }
  const version = data[offset + 8]!
  const flags =
    (data[offset + 9]! << 16) | (data[offset + 10]! << 8) | data[offset + 11]!
  let pos = offset + 12
  const end = offset + size

  if (version === 2 || version === 1) {
    if (pos + 8 > end) {
      return null
    }
    const itemId = (data[pos]! << 8) | data[pos + 1]!
    pos += 2
    const itemProtectionIndex = (data[pos]! << 8) | data[pos + 1]!
    pos += 2
    const itemType = String.fromCharCode(data[pos]!, data[pos + 1]!, data[pos + 2]!, data[pos + 3]!)
    pos += 4
    const name = readCString(data, pos, end)
    pos = name.next

    let contentType: string | undefined
    let contentEncoding: string | undefined
    if (itemType === 'mime' && pos < end) {
      const ct = readCString(data, pos, end)
      contentType = ct.value || undefined
      pos = ct.next
      if (pos < end && data[pos] !== 0) {
        const ce = readCString(data, pos, end)
        contentEncoding = ce.value || undefined
      }
    }

    return {
      version,
      flags,
      itemId,
      itemProtectionIndex,
      itemType,
      itemName: name.value,
      contentType,
      contentEncoding,
      boxOffset: offset,
      boxSize: size,
    }
  }

  if (version === 0) {
    if (pos + 4 > end) {
      return null
    }
    const itemId = (data[pos]! << 8) | data[pos + 1]!
    pos += 2
    const itemProtectionIndex = (data[pos]! << 8) | data[pos + 1]!
    pos += 2
    const name = readCString(data, pos, end)
    return {
      version,
      flags,
      itemId,
      itemProtectionIndex,
      itemType: '',
      itemName: name.value,
      boxOffset: offset,
      boxSize: size,
    }
  }

  return null
}

export function infeFields(entry: InfeEntry): ReadableField[] {
  const typeKey = entry.itemType.trim()
  const fields: ReadableField[] = [
    { key: 'version', value: String(entry.version) },
    { key: 'flags', value: `0x${entry.flags.toString(16).padStart(6, '0')}` },
    { key: 'item_ID', value: String(entry.itemId) },
    { key: 'item_protection_index', value: String(entry.itemProtectionIndex) },
  ]
  if (entry.version >= 1) {
    fields.push(
      { key: 'item_type', value: typeKey || '—' },
      ...(typeKey ? [{ key: 'item_type 含义', value: explainItemType(typeKey) }] : []),
    )
  }
  fields.push({ key: 'item_name', value: entry.itemName || '（空）' })
  if (typeKey === 'mime') {
    fields.push({ key: 'content_type', value: entry.contentType ?? '—' })
    if (entry.contentEncoding) {
      fields.push({ key: 'content_encoding', value: entry.contentEncoding })
    }
  }
  return fields
}

export function iinfFields(header: IinfHeader, entries: InfeEntry[]): ReadableField[] {
  const fields: ReadableField[] = [
    { key: 'version', value: String(header.version) },
    { key: 'flags', value: `0x${header.flags.toString(16).padStart(6, '0')}` },
    {
      key: 'entry_count',
      value: `${header.entryCount}（${header.entryCountWidth} 字节，FullBox 后 offset +12）`,
    },
  ]
  if (entries.length !== header.entryCount) {
    fields.push({
      key: 'entry_count 校验',
      value: `头部声明 ${header.entryCount}，已解析 ${entries.length} 个 infe`,
    })
  }
  for (const e of entries.slice(0, 80)) {
    const typeKey = e.itemType.trim()
    fields.push({
      key: `infe #${e.itemId}`,
      value: [typeKey, e.itemName ? `"${e.itemName}"` : null, e.contentType].filter(Boolean).join(' · ') || '—',
    })
  }
  if (entries.length > 80) {
    fields.push({ key: '…', value: `另有 ${entries.length - 80} 个 infe` })
  }
  return fields
}
