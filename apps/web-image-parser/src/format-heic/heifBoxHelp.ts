/**
 * HEIF / ISOBMFF box 语义说明，对齐内部 Wiki「HEIF图像封装格式」
 * @see https://my.feishu.cn/wiki/OVZDwTPG4iBNu2kgMI3c5D8ln2c
 */

export const FTYP_BRAND_MEANINGS: Record<string, string> = {
  isom: 'ISO Base Media File（ISOBMFF 基础兼容）',
  heic: 'HEIF · HEVC 编码图像',
  heix: 'HEIF · HEVC 10-bit',
  hevc: 'HEVC 编码兼容',
  hev1: 'HEVC 编码兼容',
  mif1: 'Multi-Image Format v1（HEIF 多图像基础）',
  msf1: 'Multi-Sequence Format v1',
  avif: 'AVIF（AV1 编码）',
  avis: 'AVIF 序列',
  jxla: 'JPEG XL 动画',
  jxl: 'JPEG XL',
}

export const INFE_ITEM_TYPES: Record<string, string> = {
  hvc1: 'HEVC 主图像 / 分块 / 缩略图',
  hev1: 'HEVC 主图像',
  avc1: 'AVC 图像',
  grid: '网格合成项（多 tile 组合）',
  Exif: 'EXIF 元数据（通常位于 mdat，由 iloc 索引）',
  mime: 'MIME 元数据（如 XMP application/rdf+xml）',
  uri: 'URI 元数据',
  thmb: '缩略图项',
  auxl: '辅助图像（景深 / Alpha 等）',
}

export const IREF_KIND_MEANINGS: Record<string, string> = {
  dimg: 'Derived Image · 网格根项 → 各 tile 分块',
  thmb: 'Thumbnail · 主图 ↔ 缩略图',
  auxl: 'Auxiliary · 主图 ↔ 辅助图像',
  cdsc: 'Content Description · 内容描述关联',
  prem: 'Premultiplied Alpha 关联',
}

export const BOX_ROLE_SUMMARY: Record<string, string> = {
  ftyp:
    'FileType Box：标识文件主品牌与兼容品牌；解析器据此判断是否为 HEIF/HEIC（如 heic、mif1）。',
  meta:
    'Metadata Box：HEIF 必须存在的顶层元数据容器；声明 Item、位置（iloc）、属性（iprp）、引用（iref），不直接存图像数据。',
  hdlr:
    'Handler Reference Box：声明 meta 用途；HEIF 图像文件 handler_type 必须为 pict。',
  pitm: 'Primary Item Box：指定默认展示的主 Item ID（渲染入口）。',
  iinf: 'Item Information Box：列出所有 Item 的 infe 条目（ID、类型、名称等）。',
  infe: 'Item Information Entry：单个 Item 的元信息；物理数据在 mdat/idat，由 iloc 定位。',
  iloc:
    'Item Location Box：将 item_id 映射到文件绝对偏移；绝对地址 = base_offset + extent_offset，长度 = extent_length。',
  iprp:
    'Item Properties Box：属性容器，含 ipco（属性池）与 ipma（Item ↔ 属性索引绑定）。',
  ipco: 'Item Property Container：按顺序定义 ispe / colr / irot / hvcC 等属性，索引从 1 起。',
  ipma: 'Item Property Association：将 ipco 中的属性（1-based index）绑定到具体 Item。',
  ispe: 'Image Spatial Extents：图像宽高（像素）。',
  colr: 'Color Information：颜色空间（nclx 参数或 ICC profile）。',
  hvcC: 'HEVC Decoder Configuration：HEVC 码流解码参数（配合 hvc1 item 使用）。',
  irot: 'Image Rotation：旋转 0/90/180/270°（angle 0–3）。',
  imir: 'Image Mirror：镜像轴（0=垂直，1=水平）。',
  iref: 'Item Reference Box：Item 间引用关系（网格 dimg、缩略图 thmb 等）。',
  mdat:
    'Media Data Box：媒体数据仓库；内部无分隔符，Item 边界完全由 meta.iloc 描述。',
  idat: 'Item Data Box：与 mdat 类似，用于 construction_method=1 的 item 数据。',
}

export function explainFtypBrand(brand: string): string {
  return FTYP_BRAND_MEANINGS[brand] ?? '—'
}

export function explainItemType(type: string): string {
  return INFE_ITEM_TYPES[type.trim()] ?? '—'
}

export function explainIrefKind(kind: string): string {
  return IREF_KIND_MEANINGS[kind] ?? '—'
}

export function boxRoleSummary(type: string): string | undefined {
  return BOX_ROLE_SUMMARY[type.trim()] ?? BOX_ROLE_SUMMARY[type]
}

/** ISO/IEC 23008-12 推荐的 HEIF 渲染协作链（Wiki §六） */
export const HEIF_RENDER_PIPELINE = [
  'ftyp → 确认 HEIF/HEIC 品牌',
  'meta.hdlr → handler_type = pict',
  'iinf.infe → 枚举 Item（hvc1 / Exif / mime …）',
  'pitm → 默认主图 item_id',
  'iloc → Item 在 mdat 中的 offset + length',
  'iprp.ipma + ipco → ispe 宽高、colr 色域、irot/imir 变换',
  'mdat → 读取 HEVC/Exif 等原始字节并解码渲染',
]
