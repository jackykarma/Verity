/**
 * ExifTool JPEG 标签对照表
 * @see https://exiftool.org/TagNames/JPEG.html
 * 子规范链接见各条目的 subSpecUrl
 */

export const EXIFTOOL_JPEG_ROOT = 'https://exiftool.org/TagNames/JPEG.html'

export interface ExifToolJpegRef {
  tagId: string
  tagName: string
  subSpecUrl: string
  description?: string
}

export interface AppPayloadMatch extends ExifToolJpegRef {
  /** 匹配到的 payload 标识（ASCII） */
  signature?: string
}

function readAscii(data: Uint8Array, offset: number, maxLen: number): string {
  let out = ''
  for (let i = 0; i < maxLen && offset + i < data.length; i++) {
    const c = data[offset + i]
    if (c === undefined || c === 0) {
      break
    }
    out += String.fromCharCode(c)
  }
  return out
}

/** APP0–APP15 payload 识别规则（按 ExifTool JPEG 表优先级） */
const APP_PAYLOAD_RULES: Record<number, { prefix: string; match: AppPayloadMatch }[]> = {
  0: [
    { prefix: 'JFIF', match: { tagId: 'APP0', tagName: 'JFIF', subSpecUrl: 'https://exiftool.org/TagNames/JFIF.html' } },
    { prefix: 'JFXX', match: { tagId: 'APP0', tagName: 'JFXX', subSpecUrl: 'https://exiftool.org/TagNames/JFIF.html#Extension', description: 'JFIF 扩展' } },
    { prefix: 'CIFF', match: { tagId: 'APP0', tagName: 'CIFF', subSpecUrl: 'https://exiftool.org/TagNames/CanonRaw.html' } },
    { prefix: 'AVI1', match: { tagId: 'APP0', tagName: 'AVI1', subSpecUrl: 'https://exiftool.org/TagNames/JPEG.html#AVI1', description: 'AVI 视频帧 JPEG' } },
    { prefix: 'Ocad', match: { tagId: 'APP0', tagName: 'Ocad', subSpecUrl: 'https://exiftool.org/TagNames/JPEG.html#Ocad' } },
  ],
  1: [
    { prefix: 'Exif', match: { tagId: 'APP1', tagName: 'EXIF', subSpecUrl: 'https://exiftool.org/TagNames/EXIF.html' } },
    {
      prefix: 'http://ns.adobe.com/xmp/extension/',
      match: { tagId: 'APP1', tagName: 'ExtendedXMP', subSpecUrl: 'https://exiftool.org/TagNames/XMP.html', description: '扩展 XMP 包' },
    },
    {
      prefix: 'http://ns.adobe.com/xap/1.0/',
      match: { tagId: 'APP1', tagName: 'XMP', subSpecUrl: 'https://exiftool.org/TagNames/XMP.html' },
    },
    { prefix: 'FLIR', match: { tagId: 'APP1', tagName: 'FLIR', subSpecUrl: 'https://exiftool.org/TagNames/FLIR.html#FFF' } },
  ],
  2: [
    { prefix: 'ICC_PROFILE', match: { tagId: 'APP2', tagName: 'ICC_Profile', subSpecUrl: 'https://exiftool.org/TagNames/ICC_Profile.html' } },
    { prefix: 'FPXR', match: { tagId: 'APP2', tagName: 'FPXR', subSpecUrl: 'https://exiftool.org/TagNames/FlashPix.html' } },
    { prefix: 'MPF', match: { tagId: 'APP2', tagName: 'MPF', subSpecUrl: 'https://exiftool.org/TagNames/MPF.html' } },
    { prefix: 'InfiRay', match: { tagId: 'APP2', tagName: 'InfiRayVersion', subSpecUrl: 'https://exiftool.org/TagNames/InfiRay.html#Version' } },
  ],
  3: [
    { prefix: 'Meta', match: { tagId: 'APP3', tagName: 'Meta', subSpecUrl: 'https://exiftool.org/TagNames/Kodak.html#Meta' } },
    { prefix: 'Stim', match: { tagId: 'APP3', tagName: 'Stim', subSpecUrl: 'https://exiftool.org/TagNames/Stim.html' } },
    { prefix: 'JPS', match: { tagId: 'APP3', tagName: 'JPS', subSpecUrl: 'https://exiftool.org/TagNames/JPEG.html#JPS', description: 'JPEG Stereo' } },
  ],
  4: [
    { prefix: 'Scalado', match: { tagId: 'APP4', tagName: 'Scalado', subSpecUrl: 'https://exiftool.org/TagNames/Scalado.html' } },
    { prefix: 'Qualcomm', match: { tagId: 'APP4', tagName: 'QualcommDualCamera', subSpecUrl: 'https://exiftool.org/TagNames/Qualcomm.html#DualCamera' } },
  ],
  5: [
    { prefix: 'RMETA', match: { tagId: 'APP5', tagName: 'RMETA', subSpecUrl: 'https://exiftool.org/TagNames/Ricoh.html#RMETA' } },
    { prefix: 'Samsung', match: { tagId: 'APP5', tagName: 'SamsungUniqueID', subSpecUrl: 'https://exiftool.org/TagNames/Samsung.html#APP5' } },
  ],
  6: [
    { prefix: 'EPPIM', match: { tagId: 'APP6', tagName: 'EPPIM', subSpecUrl: 'https://exiftool.org/TagNames/JPEG.html#EPPIM' } },
    { prefix: 'NITF', match: { tagId: 'APP6', tagName: 'NITF', subSpecUrl: 'https://exiftool.org/TagNames/JPEG.html#NITF' } },
    { prefix: 'GoPro', match: { tagId: 'APP6', tagName: 'GoPro', subSpecUrl: 'https://exiftool.org/TagNames/GoPro.html#GPMF' } },
  ],
  7: [
    { prefix: 'Pentax', match: { tagId: 'APP7', tagName: 'Pentax', subSpecUrl: 'https://exiftool.org/TagNames/Pentax.html' } },
    { prefix: 'Huawei', match: { tagId: 'APP7', tagName: 'Huawei', subSpecUrl: 'https://exiftool.org/TagNames/Unknown.html' } },
  ],
  8: [
    { prefix: 'SPIFF', match: { tagId: 'APP8', tagName: 'SPIFF', subSpecUrl: 'https://exiftool.org/TagNames/JPEG.html#SPIFF' } },
  ],
  9: [
    { prefix: 'MediaJukebox', match: { tagId: 'APP9', tagName: 'MediaJukebox', subSpecUrl: 'https://exiftool.org/TagNames/JPEG.html#MediaJukebox' } },
  ],
  10: [
    { prefix: 'HDRGainInfo', match: { tagId: 'APP10', tagName: 'HDRGainInfo', subSpecUrl: 'https://exiftool.org/TagNames/JPEG.html#HDRGainInfo' } },
  ],
  11: [
    { prefix: 'JPEG-HDR', match: { tagId: 'APP11', tagName: 'JPEG-HDR', subSpecUrl: 'https://exiftool.org/TagNames/JPEG.html#HDR' } },
    { prefix: 'JUMBF', match: { tagId: 'APP11', tagName: 'JUMBF', subSpecUrl: 'https://exiftool.org/TagNames/Jpeg2000.html' } },
  ],
  12: [
    { prefix: 'PictureInfo', match: { tagId: 'APP12', tagName: 'PictureInfo', subSpecUrl: 'https://exiftool.org/TagNames/APP12.html#PictureInfo' } },
    { prefix: 'Ducky', match: { tagId: 'APP12', tagName: 'Ducky', subSpecUrl: 'https://exiftool.org/TagNames/APP12.html#Ducky' } },
  ],
  13: [
    { prefix: 'Photoshop', match: { tagId: 'APP13', tagName: 'Photoshop', subSpecUrl: 'https://exiftool.org/TagNames/Photoshop.html' } },
    { prefix: 'Adobe_CM', match: { tagId: 'APP13', tagName: 'Adobe_CM', subSpecUrl: 'https://exiftool.org/TagNames/JPEG.html#AdobeCM' } },
  ],
  14: [
    { prefix: 'Adobe', match: { tagId: 'APP14', tagName: 'Adobe', subSpecUrl: 'https://exiftool.org/TagNames/JPEG.html#Adobe' } },
  ],
  15: [
    { prefix: 'GraphicConverter', match: { tagId: 'APP15', tagName: 'GraphicConverter', subSpecUrl: 'https://exiftool.org/TagNames/JPEG.html#GraphConv' } },
  ],
}

const MARKER_REFS: Record<string, ExifToolJpegRef> = {
  'PAR-JPEG-001': { tagId: 'SOI', tagName: 'StartOfImage', subSpecUrl: EXIFTOOL_JPEG_ROOT },
  'PAR-JPEG-002': { tagId: 'EOI', tagName: 'EndOfImage', subSpecUrl: EXIFTOOL_JPEG_ROOT },
  'PAR-JPEG-010': { tagId: 'COM', tagName: 'Comment', subSpecUrl: EXIFTOOL_JPEG_ROOT },
  'PAR-JPEG-011': { tagId: 'DQT', tagName: 'DefineQuantizationTable', subSpecUrl: EXIFTOOL_JPEG_ROOT },
  'PAR-JPEG-012': { tagId: 'DHT', tagName: 'DefineHuffmanTable', subSpecUrl: EXIFTOOL_JPEG_ROOT },
  'PAR-JPEG-013': { tagId: 'SOF', tagName: 'StartOfFrame', subSpecUrl: 'https://exiftool.org/TagNames/JPEG.html#SOF' },
  'PAR-JPEG-014': { tagId: 'SOS', tagName: 'StartOfScan', subSpecUrl: EXIFTOOL_JPEG_ROOT },
  'PAR-JPEG-016': { tagId: 'DRI', tagName: 'DefineRestartInterval', subSpecUrl: EXIFTOOL_JPEG_ROOT },
  'PAR-JPEG-017': { tagId: 'RST', tagName: 'RestartMarker', subSpecUrl: EXIFTOOL_JPEG_ROOT },
  'PAR-JPEG-020': { tagId: 'SOF', tagName: 'StartOfFrame', subSpecUrl: 'https://exiftool.org/TagNames/JPEG.html#SOF' },
  'PAR-JPEG-028': { tagId: 'APP2', tagName: 'MPF', subSpecUrl: 'https://exiftool.org/TagNames/MPF.html' },
}

const SOF_ENCODING: Record<number, string> = {
  0xc0: 'Baseline DCT, Huffman coding (0x0)',
  0xc1: 'Extended sequential DCT, Huffman coding (0x1)',
  0xc2: 'Progressive DCT, Huffman coding (0x2)',
  0xc3: 'Lossless, Huffman coding (0x3)',
  0xc5: 'Sequential DCT, differential Huffman (0x5)',
  0xc6: 'Progressive DCT, differential Huffman (0x6)',
  0xc7: 'Lossless, differential Huffman (0x7)',
  0xc9: 'Extended sequential DCT, arithmetic (0x9)',
  0xca: 'Progressive DCT, arithmetic (0xa)',
  0xcb: 'Lossless, arithmetic (0xb)',
  0xcd: 'Sequential DCT, differential arithmetic (0xd)',
  0xce: 'Progressive DCT, differential arithmetic (0xe)',
  0xcf: 'Lossless, differential arithmetic (0xf)',
}

export function matchAppPayload(
  appNumber: number,
  data: Uint8Array,
  payloadStart: number,
): AppPayloadMatch | null {
  const rules = APP_PAYLOAD_RULES[appNumber]
  if (!rules) {
    return {
      tagId: `APP${appNumber}`,
      tagName: `APP${appNumber}`,
      subSpecUrl: EXIFTOOL_JPEG_ROOT,
      description: '未识别 payload，参见 ExifTool JPEG Tags',
    }
  }

  const head = readAscii(data, payloadStart, 64)
  for (const rule of rules) {
    if (head.startsWith(rule.prefix)) {
      return { ...rule.match, signature: rule.prefix }
    }
  }

  return {
    tagId: `APP${appNumber}`,
    tagName: `APP${appNumber}`,
    subSpecUrl: EXIFTOOL_JPEG_ROOT,
    signature: readAscii(data, payloadStart, 16) || undefined,
    description: '未匹配已知 ExifTool payload 标识',
  }
}

export function refForCatalogId(parCatalogId: string, marker?: number): ExifToolJpegRef | null {
  const direct = MARKER_REFS[parCatalogId]
  if (direct) {
    return direct
  }
  if (marker !== undefined && marker >= 0xc0 && marker <= 0xcf) {
    return {
      tagId: 'SOF',
      tagName: 'StartOfFrame',
      subSpecUrl: 'https://exiftool.org/TagNames/JPEG.html#SOF',
      description: SOF_ENCODING[marker],
    }
  }
  return null
}

export function sofEncodingLabel(marker: number): string | null {
  return SOF_ENCODING[marker] ?? null
}

export function buildExifToolRefFields(ref: ExifToolJpegRef): { key: string; value: string }[] {
  const fields = [
    { key: 'ExifTool Tag ID', value: ref.tagId },
    { key: 'ExifTool Tag Name', value: ref.tagName },
    { key: 'ExifTool 规范', value: ref.subSpecUrl },
  ]
  if (ref.description) {
    fields.push({ key: '说明', value: ref.description })
  }
  return fields
}

/** 列出某 APP 编号在 ExifTool 文档中登记的所有 payload 类型（只读参考） */
export function listKnownAppPayloads(appNumber: number): string[] {
  return (APP_PAYLOAD_RULES[appNumber] ?? []).map((r) => r.match.tagName)
}
