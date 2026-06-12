import { SHARE_TEXT } from './constants'

type ShareResult = 'shared' | 'cancelled' | 'fallback-saved'

// 盤面 PNG を標準シェアシートで画像つき共有。非対応なら保存にフォールバック。
export async function shareCard(blob: Blob): Promise<ShareResult> {
  const file = new File([blob], 'osanpo-bingo.png', { type: 'image/png' })
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean
  }
  if (nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: SHARE_TEXT, title: 'おさんぽビンゴ' })
      return 'shared'
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return 'cancelled'
      // それ以外のエラーは保存にフォールバック
    }
  }
  saveImage(blob)
  return 'fallback-saved'
}

export function saveImage(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'osanpo-bingo.png'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function shareToLine() {
  window.open(
    'https://line.me/R/msg/text/?' + encodeURIComponent(SHARE_TEXT),
    '_blank',
  )
}

export function shareToX() {
  window.open(
    'https://x.com/intent/tweet?text=' + encodeURIComponent(SHARE_TEXT),
    '_blank',
  )
}
