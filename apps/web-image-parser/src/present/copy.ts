export const PRESENT_COPY = {
  NO_CONTENT: '该分区暂无可呈现内容',
  PREVIEW_FAILED: '图片预览失败',
  PLAYBACK_FAILED: '媒体播放失败',
  PAYLOAD_TOO_LARGE: '负载过大，无法预览',
  ENV_UNSUPPORTED: '当前浏览器不支持此 HEIC 内容预览',
  LOADING: '正在加载…',
} as const

export function presentFailureMessage(kind: keyof typeof PRESENT_COPY): string {
  return PRESENT_COPY[kind]
}
