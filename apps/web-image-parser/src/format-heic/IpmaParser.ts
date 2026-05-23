import type { BmffBox } from './BmffReader.ts'

export interface IpmaEntry {
  itemId: number
  associations: { essential: boolean; propertyIndex: number }[]
}

export function parseIpma(data: Uint8Array, ipmaBox: BmffBox): IpmaEntry[] {
  const entries: IpmaEntry[] = []
  const end = ipmaBox.offset + ipmaBox.size
  const version = data[ipmaBox.offset + 8] ?? 0
  let pos = ipmaBox.offset + 12

  if (pos + 4 > end) {
    return entries
  }

  const entryCount =
    version === 0
      ? (data[pos]! << 24) | (data[pos + 1]! << 16) | (data[pos + 2]! << 8) | data[pos + 3]!
      : (data[pos]! << 8) | data[pos + 1]!
  pos += version === 0 ? 4 : 2

  for (let i = 0; i < entryCount && pos + 3 <= end; i++) {
    const itemId =
      version < 1
        ? (data[pos]! << 8) | data[pos + 1]!
        : (data[pos]! << 24) | (data[pos + 1]! << 16) | (data[pos + 2]! << 8) | data[pos + 3]!
    pos += version < 1 ? 2 : 4

    const assocCount = data[pos]!
    pos += 1
    const associations: IpmaEntry['associations'] = []

    for (let a = 0; a < assocCount && pos < end; a++) {
      const byte = data[pos]!
      pos += 1
      associations.push({
        essential: (byte & 0x80) !== 0,
        propertyIndex: byte & 0x7f,
      })
    }

    entries.push({ itemId, associations })
  }

  return entries
}

export function formatIpmaSummary(entries: IpmaEntry[]): string {
  if (entries.length === 0) {
    return 'ipma（无条目）'
  }
  const parts = entries.map((e) => {
    const props = e.associations
      .map((a) => (a.essential ? `★${a.propertyIndex}` : String(a.propertyIndex)))
      .join(',')
    return `#${e.itemId}→[${props}]`
  })
  return `ipma (${parts.join('; ')})`
}
