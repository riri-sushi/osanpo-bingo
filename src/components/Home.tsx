import { SIZE_CARDS } from '../constants'
import type { Size } from '../types'

export function Home({ onPick }: { onPick: (size: Size) => void }) {
  return (
    <section className="screen" id="home">
      <div className="eyebrow">さんぽが冒険になる</div>
      <h1 className="logo">
        おさんぽ
        <br />
        ビンゴ
      </h1>
      <p className="sub">
        マスに「見つけたいもの」を書いて、散歩しながらタップ。長押しで写真も撮れるよ。まずは大きさを選ぼう！
      </p>
      <div className="size-list">
        {SIZE_CARDS.map((c) => (
          <button
            key={c.size}
            type="button"
            className="size-card"
            onClick={() => onPick(c.size)}
          >
            <div
              className="mini"
              style={{ gridTemplateColumns: `repeat(${c.size},1fr)` }}
            >
              {Array.from({ length: c.size * c.size }, (_, i) => (
                <i key={i} />
              ))}
            </div>
            <div className="meta">
              <b>{c.label}</b>
              <span>{c.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
