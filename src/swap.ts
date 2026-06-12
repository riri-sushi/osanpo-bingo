import type { Size, SwapPayload } from './types'

// カードの「サイズ＋各マスの文字」をコード化（写真は含めない）
export function encodeCard(size: Size, words: string[]): string {
  const data: SwapPayload = { s: size, w: words }
  return btoa(encodeURIComponent(JSON.stringify(data)))
}

export type DecodedCard = { size: Size; words: string[] }

// 逆変換。失敗時は例外を投げる（呼び出し側で案内する）
export function decodeCard(code: string): DecodedCard {
  const d = JSON.parse(decodeURIComponent(atob(code.trim()))) as SwapPayload
  if (![3, 4, 5].includes(d.s) || !Array.isArray(d.w))
    throw new Error('コードの中身が正しくありません')
  const size = d.s as Size
  const n = size * size
  const words = Array.from({ length: n }, (_, i) => String(d.w[i] ?? ''))
  return { size, words }
}
