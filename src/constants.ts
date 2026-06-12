import type { Size } from './types'

// ポップ5色（マークの塗り・アクセント）
export const PALETTE = ['#FF5C7A', '#FFD23F', '#2EC4B6', '#4D9DE0', '#9B5DE5']

export const MAX_LEN = 50

export const SHARE_TEXT = 'おさんぽビンゴでビンゴしたよ！ #おさんぽビンゴ'

export const SIZE_CARDS: { size: Size; label: string; desc: string }[] = [
  { size: 3, label: '3 × 3', desc: 'さくっと9マス・お散歩デビューに' },
  { size: 4, label: '4 × 4', desc: 'ほどよい16マス・公園ひとまわり' },
  { size: 5, label: '5 × 5', desc: 'がっつり25マス・遠出のおとも' },
]

// サロゲートペアを含めて正しく数える文字数
export const charLen = (s: string) => [...s].length

// マスの文字サイズ（サイズ別）
export const fontFor = (size: Size) =>
  size === 3 ? '1rem' : size === 4 ? '.82rem' : '.68rem'
