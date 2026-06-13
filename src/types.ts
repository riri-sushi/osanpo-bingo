export type Size = 3 | 4 | 5

export type BoardState = {
  size: Size
  words: string[] // length = size*size, 各50文字以内
  marked: boolean[] // length = size*size
  photoIds: (string | null)[] // IndexedDB 上の画像キー（なければ null）
}

// 交換コードのペイロード（写真は含めない＝文字とサイズのみ）
export type SwapPayload = { s: number; w: string[] }

// 保存した「やり切ったビンゴ」（盤面画像＋表示用メタ）
export type SavedCard = {
  id: string
  createdAt: number // 保存時刻（ミリ秒）
  size: Size
  words: string[]
  image: Blob // 完成盤面の PNG
}

export type Screen = 'home' | 'edit' | 'play' | 'gallery'
