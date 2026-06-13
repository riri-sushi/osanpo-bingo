import type { Size, SwapPayload } from './types'

// ── UTF-8 文字列 ⇄ base64（日本語をそのままバイト列で扱うので encodeURIComponent より大幅に短い）──
function utf8ToBase64(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function base64ToUtf8(b64: string): string {
  const bin = atob(b64)
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

// カードの「サイズ＋各マスの文字」をコード化（写真は含めない）
// 末尾の空マスは捨ててコードを短くする（decode 側で size から復元）。
export function encodeCard(size: Size, words: string[]): string {
  const trimmed = words.slice()
  while (trimmed.length && !trimmed[trimmed.length - 1]) trimmed.pop()
  const data: SwapPayload = { s: size, w: trimmed }
  return utf8ToBase64(JSON.stringify(data))
}

export type DecodedCard = { size: Size; words: string[] }

// 逆変換。失敗時は例外を投げる（呼び出し側で案内する）。
// 新形式（UTF-8→base64）を試し、ダメなら旧形式（encodeURIComponent 経由）も試す。
export function decodeCard(code: string): DecodedCard {
  const raw = code.trim()
  let json: string
  try {
    json = base64ToUtf8(raw)
    JSON.parse(json) // 妥当性チェック（旧形式だとここで壊れることがある）
  } catch {
    json = decodeURIComponent(atob(raw)) // 旧形式フォールバック
  }
  const d = JSON.parse(json) as SwapPayload
  if (![3, 4, 5].includes(d.s) || !Array.isArray(d.w))
    throw new Error('コードの中身が正しくありません')
  const size = d.s as Size
  const n = size * size
  const words = Array.from({ length: n }, (_, i) => String(d.w[i] ?? ''))
  return { size, words }
}
