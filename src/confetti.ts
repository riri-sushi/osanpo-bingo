import { PALETTE } from './constants'

// クラッカー風「パーン！」バースト（canvas 物理）。プロトタイプの実装に準拠。

type Part = {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  rot: number
  vr: number
  color: string
  life: number
  ribbon: boolean
}

const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion:reduce)').matches

export function popConfetti(canvas: HTMLCanvasElement, host: HTMLElement) {
  // モーション控えめ設定では演出を出さない
  if (prefersReduced()) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = host.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
  const W = canvas.width
  const H = canvas.height

  const parts: Part[] = []
  // 左下・中央下・右下の3台のクラッカーから大量に発射 → 画面いっぱいに舞う
  const guns = [
    { x: W * 0.04, y: H * 1.0, dir: -Math.PI / 3 },
    { x: W * 0.5, y: H * 1.02, dir: -Math.PI / 2 },
    { x: W * 0.96, y: H * 1.0, dir: (-Math.PI * 2) / 3 },
  ]
  for (const g of guns) {
    for (let i = 0; i < 120; i++) {
      const a = g.dir + (Math.random() - 0.5) * 1.3 // 広い扇状
      const sp = 12 + Math.random() * 16 // 高初速＝天井まで届く
      parts.push({
        x: g.x,
        y: g.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        w: 6 + Math.random() * 6,
        h: 9 + Math.random() * 8,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.5,
        color: PALETTE[(Math.random() * PALETTE.length) | 0],
        life: 1,
        ribbon: Math.random() < 0.25, // 紙テープ風のひらひら
      })
    }
  }

  let rafId = 0
  const tick = () => {
    ctx.clearRect(0, 0, W, H)
    let alive = false
    for (const p of parts) {
      if (p.life <= 0) continue
      p.vy += 0.34 // 重力
      p.vx *= 0.985 // 空気抵抗
      p.vy *= 0.985
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      if (p.y > H * 0.62) p.life -= 0.012 // 下に落ちきると消えていく
      if (p.y > H + 30) p.life = 0
      if (p.life > 0) {
        alive = true
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        if (p.ribbon) ctx.fillRect(-p.w / 2, -p.h, p.w * 0.5, p.h * 1.8)
        else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
    }
    if (alive) rafId = requestAnimationFrame(tick)
    else ctx.clearRect(0, 0, W, H)
  }
  rafId = requestAnimationFrame(tick)
  // 後始末用に停止関数を返す
  return () => {
    cancelAnimationFrame(rafId)
    ctx.clearRect(0, 0, W, H)
  }
}
