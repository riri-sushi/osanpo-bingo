// 撮影/選択した画像を正方形（中央クロップ）にして dataURL を返す

const OUT_SIZE = 720 // マス背景・シェア画像で十分な解像度

function cropToSquareDataUrl(
  source: CanvasImageSource,
  sw: number,
  sh: number,
): string {
  const side = Math.min(sw, sh)
  const sx = (sw - side) / 2
  const sy = (sh - side) / 2
  const canvas = document.createElement('canvas')
  canvas.width = OUT_SIZE
  canvas.height = OUT_SIZE
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(source, sx, sy, side, side, 0, 0, OUT_SIZE, OUT_SIZE)
  return canvas.toDataURL('image/jpeg', 0.85)
}

// <video> の現在フレームを中央クロップ
export function captureSquareFromVideo(video: HTMLVideoElement): string {
  return cropToSquareDataUrl(video, video.videoWidth, video.videoHeight)
}

// File（input type=file 由来）を中央クロップ
export function captureSquareFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () =>
        resolve(cropToSquareDataUrl(img, img.naturalWidth, img.naturalHeight))
      img.onerror = () => reject(new Error('画像を読み込めませんでした'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('ファイルを読み込めませんでした'))
    reader.readAsDataURL(file)
  })
}
