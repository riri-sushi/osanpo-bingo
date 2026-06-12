export type Size = 3 | 4 | 5

export type BoardState = {
  size: Size
  words: string[] // length = size*size, 各50文字以内
  marked: boolean[] // length = size*size
  photoIds: (string | null)[] // IndexedDB 上の画像キー（なければ null）
}

// 交換コードのペイロード（写真は含めない＝文字とサイズのみ）
export type SwapPayload = { s: number; w: string[] }

export type Screen = 'home' | 'edit' | 'play'
