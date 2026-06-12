import type { Size } from './types'

// 全行・全列・対角線2本のインデックス配列を返す
export function lines(size: Size): number[][] {
  const n = size
  const L: number[][] = []
  for (let r = 0; r < n; r++) L.push([...Array(n)].map((_, c) => r * n + c))
  for (let c = 0; c < n; c++) L.push([...Array(n)].map((_, r) => r * n + c))
  L.push([...Array(n)].map((_, k) => k * n + k))
  L.push([...Array(n)].map((_, k) => k * n + (n - 1 - k)))
  return L
}

export type Evaluation = {
  bingo: boolean
  reach: Set<number> // リーチで強調する未マスのインデックス
}

export function evaluate(size: Size, marked: boolean[]): Evaluation {
  let bingo = false
  const reach = new Set<number>()
  for (const line of lines(size)) {
    const got = line.filter((i) => marked[i]).length
    if (got === size) bingo = true
    else if (got === size - 1)
      line.forEach((i) => {
        if (!marked[i]) reach.add(i)
      })
  }
  return { bingo, reach }
}
