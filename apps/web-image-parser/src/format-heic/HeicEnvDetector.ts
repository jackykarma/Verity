export type HeicEnvLevel = 'A' | 'B' | 'C'

export interface HeicEnvReport {
  level: HeicEnvLevel
  canPreviewImage: boolean
  canPlayVideo: boolean
  message: string
}

export function detectHeicEnvironment(): HeicEnvReport {
  if (typeof navigator === 'undefined' || typeof document === 'undefined') {
    return {
      level: 'B',
      canPreviewImage: true,
      canPlayVideo: false,
      message: '非浏览器环境',
    }
  }

  const ua = navigator.userAgent
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua)
  if (isSafari) {
    return {
      level: 'A',
      canPreviewImage: true,
      canPlayVideo: true,
      message: 'Safari 原生 HEIC 支持',
    }
  }

  const canvas = document.createElement('canvas')
  const canHeic = canvas.toDataURL('image/heic').startsWith('data:image/heic')
  if (canHeic) {
    return {
      level: 'B',
      canPreviewImage: true,
      canPlayVideo: false,
      message: '部分 HEIC 预览支持',
    }
  }

  return {
    level: 'C',
    canPreviewImage: false,
    canPlayVideo: false,
    message: '当前浏览器不支持 HEIC 预览，仅可查看结构树',
  }
}
