import { PALETTE } from './constants'
import type { BoardState } from './types'

// 盤面を canvas で PNG 画像に描画（タイトル＋文字・マーク色・写真・白文字＋スクリムまで再現）

function roundRectPath(
  x: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  r: number,
) {
  x.beginPath()
  x.moveTo(bx + r, by)
  x.arcTo(bx + bw, by, bx + bw, by + bh, r)
  x.arcTo(bx + bw, by + bh, bx, by + bh, r)
  x.arcTo(bx, by + bh, bx, by, r)
  x.arcTo(bx, by, bx + bw, by, r)
  x.closePath()
}

function drawCover(
  x: CanvasRenderingContext2D,
  img: HTMLImageElement,
  bx: number,
  by: number,
  bw: number,
  bh: number,
) {
  const ir = img.width / img.height
  const br = bw / bh
  let dw: number, dh: number
  if (ir > br) {
    dh = bh
    dw = bh * ir
  } else {
    dw = bw
    dh = bw / ir
  }
  x.drawImage(img, bx + (bw - dw) / 2, by + (bh - dh) / 2, dw, dh)
}

function wrapText(
  x: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  maxW: number,
  lh: number,
) {
  const chars = [...text]
  const out: string[] = []
  let line = ''
  for (const ch of chars) {
    if (x.measureText(line + ch).width > maxW && line) {
      out.push(line)
      line = ch
    } else line += ch
  }
  if (line) out.push(line)
  const start = cy - ((out.length - 1) * lh) / 2
  out.forEach((l, i) => x.fillText(l, cx, start + i * lh))
}

// index -> dataURL の写真マップを受け取り、PNG Blob を返す
export async function makeCardImage(
  board: BoardState,
  photoUrls: Record<number, string>,
): Promise<Blob> {
  try {
    await document.fonts.ready
  } catch {
    /* フォント未ロードでも続行 */
  }
  const n = board.size
  const S = 150
  const gap = 14
  const pad = 44
  const top = 128
  const W = pad * 2 + n * S + (n - 1) * gap
  const H = top + pad + n * S + (n - 1) * gap
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const x = c.getContext('2d')!
  x.fillStyle = '#FFF6E9'
  x.fillRect(0, 0, W, H)
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  x.fillStyle = '#FF5C7A'
  x.font = "800 30px 'M PLUS Rounded 1c',sans-serif"
  x.fillText('OSANPO BINGO', W / 2, 46)
  x.fillStyle = '#2B2D42'
  x.font = "800 52px 'M PLUS Rounded 1c',sans-serif"
  x.fillText('おさんぽビンゴ', W / 2, 88)

  // 写真を先読み
  const imgs: Record<number, HTMLImageElement> = {}
  await Promise.all(
    Object.entries(photoUrls).map(
      ([i, url]) =>
        new Promise<void>((res) => {
          const im = new Image()
          im.onload = () => {
            imgs[+i] = im
            res()
          }
          im.onerror = () => res()
          im.src = url
        }),
    ),
  )

  const fs = n === 3 ? 26 : n === 4 ? 21 : 17
  for (let i = 0; i < n * n; i++) {
    const r = (i / n) | 0
    const col = i % n
    const bx = pad + col * (S + gap)
    const by = top + r * (S + gap)
    roundRectPath(x, bx, by, S, S, 22)
    if (imgs[i]) {
      x.save()
      x.clip()
      drawCover(x, imgs[i], bx, by, S, S)
      x.fillStyle = 'rgba(43,45,66,.45)'
      x.fillRect(bx, by, S, S)
      x.restore()
      roundRectPath(x, bx, by, S, S, 22)
    } else {
      x.fillStyle = board.marked[i]
        ? PALETTE[i % PALETTE.length]
        : board.words[i]
          ? '#fff'
          : '#FFF1DB'
      x.fill()
    }
    x.lineWidth = 6
    x.strokeStyle = '#2B2D42'
    x.stroke()
    const w = board.words[i]
    if (w) {
      x.fillStyle = board.marked[i] || imgs[i] ? '#fff' : '#2B2D42'
      x.font = '800 ' + fs + "px 'M PLUS Rounded 1c',sans-serif"
      wrapText(x, w, bx + S / 2, by + S / 2, S - 18, fs + 5)
    }
  }

  return new Promise<Blob>((res, rej) =>
    c.toBlob((b) => (b ? res(b) : rej(new Error('画像化に失敗しました'))), 'image/png'),
  )
}
