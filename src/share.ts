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

// 画像をクリップボードにコピー（対応端末のみ）。成功で true。
async function copyImage(blob: Blob): Promise<boolean> {
  try {
    const w = window as unknown as { ClipboardItem?: typeof ClipboardItem }
    if (!navigator.clipboard || !w.ClipboardItem) return false
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return true
  } catch {
    return false
  }
}

// LINE / X など「文字だけ」の投稿先に、結果画像を添えて投稿してもらう。
// 画像はURL投稿に直接乗せられないため、共有シート（画像つき）→画像コピー→画像保存の順に試す。
// 戻り値は呼び出し側で案内メッセージを出し分けるためのヒント。
export type AttachResult = 'shared' | 'clipboard' | 'saved'

async function shareWithImage(
  blob: Blob,
  intentUrl: string,
): Promise<AttachResult> {
  const file = new File([blob], 'osanpo-bingo.png', { type: 'image/png' })
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean
  }
  // 1) 共有シートが画像に対応していれば、それが一番確実（投稿先で画像が乗る）
  if (nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: SHARE_TEXT, title: 'おさんぽビンゴ' })
      return 'shared'
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return 'shared'
      // 失敗時は下のフォールバックへ
    }
  }
  // 2) 画像をクリップボードへ。投稿先を開いて貼り付けてもらう。
  if (await copyImage(blob)) {
    window.open(intentUrl, '_blank')
    return 'clipboard'
  }
  // 3) 画像を保存。投稿先を開いて添付してもらう。
  saveImage(blob)
  window.open(intentUrl, '_blank')
  return 'saved'
}

export function shareToLine(blob: Blob): Promise<AttachResult> {
  const url = 'https://line.me/R/msg/text/?' + encodeURIComponent(SHARE_TEXT)
  return shareWithImage(blob, url)
}

export function shareToX(blob: Blob): Promise<AttachResult> {
  const url = 'https://x.com/intent/tweet?text=' + encodeURIComponent(SHARE_TEXT)
  return shareWithImage(blob, url)
}
