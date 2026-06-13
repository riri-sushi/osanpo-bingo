import { useEffect, useState } from 'react'
import type { SavedCard } from '../types'
import { ShareIcon } from '../icons'

type Props = {
  cards: SavedCard[]
  onBack: () => void
  onShare: (blob: Blob) => void
  onSaveImg: (blob: Blob) => void
  onDelete: (id: string) => void
}

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

export function Gallery({ cards, onBack, onShare, onSaveImg, onDelete }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [urls, setUrls] = useState<Record<string, string>>({})

  // 各カード画像の object URL を作成し、一覧が変わったら作り直す。
  // 生成と失効を同じ effect 内でペアにする（StrictMode の二重実行でも安全）。
  useEffect(() => {
    const map: Record<string, string> = {}
    for (const c of cards) map[c.id] = URL.createObjectURL(c.image)
    setUrls(map)
    return () => Object.values(map).forEach((u) => URL.revokeObjectURL(u))
  }, [cards])

  const open = cards.find((c) => c.id === openId) ?? null

  return (
    <section className="screen" id="gallery">
      <div className="topbar">
        <button className="back" onClick={onBack} aria-label="ホームに戻る">
          ←
        </button>
        <div className="ttl">ほぞんしたビンゴ</div>
        <div className="spacer" />
      </div>

      {cards.length === 0 ? (
        <p className="empty-note">
          まだありません。
          <br />
          ビンゴをやり切って「このビンゴを保存」してみよう！
        </p>
      ) : (
        <div className="gallery-grid">
          {cards.map((c) => (
            <button
              key={c.id}
              type="button"
              className="gallery-item"
              onClick={() => setOpenId(c.id)}
            >
              {urls[c.id] && (
                <img src={urls[c.id]} alt={`${formatDate(c.createdAt)}のビンゴ`} />
              )}
              <span className="gallery-date">{formatDate(c.createdAt)}</span>
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="editor" onClick={() => setOpenId(null)}>
          <div className="saved-view" onClick={(e) => e.stopPropagation()}>
            {urls[open.id] && <img src={urls[open.id]} alt="保存したビンゴ" />}
            <p className="saved-date">{formatDate(open.createdAt)}</p>
            <button className="btn coral" onClick={() => onShare(open.image)}>
              <ShareIcon />
              シェアする
            </button>
            <div className="btn-row">
              <button className="btn ghost" onClick={() => onSaveImg(open.image)}>
                画像を保存
              </button>
              <button
                className="btn ghost danger"
                onClick={() => {
                  if (confirm('この保存ビンゴを消しますか？')) {
                    onDelete(open.id)
                    setOpenId(null)
                  }
                }}
              >
                削除
              </button>
            </div>
            <button className="close-text" onClick={() => setOpenId(null)}>
              とじる
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
