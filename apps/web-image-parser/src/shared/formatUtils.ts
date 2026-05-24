/** 文件字节偏移：十六进制 + 十进制 */
export function formatByteOffset(offset: number): string {
  return `0x${offset.toString(16)} (${offset})`
}
