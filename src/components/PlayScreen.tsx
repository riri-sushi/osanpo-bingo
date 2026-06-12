import { fontFor, PALETTE } from '../constants'
import type { BoardState } from '../types'
import { evaluate } from '../bingo'
import { useLongPress } from '../useLongPress'
import { SwapIcon, BurstIcon } from '../icons'

type Props = {
  board: BoardState
  photoUrls: Record<number, string>
  onBack: () => void
  onReset: () => void
  onToggle: (index: number) => void
  onCamera: (index: number) => void
  onOpenSwap: () => void
}

function PlayCell({
  index,
  word,
  marked,
  photoUrl,
  reach,
  size,
  onToggle,
  onCamera,
}: {
  index: number
  word: string
  marked: boolean
  photoUrl?: string
  reach: boolean
  size: BoardState['size']
  onToggle: (i: number) => void
  onCamera: (i: number) => void
}) {
  const handlers = useLongPress(
    () => onToggle(index),
    () => onCamera(index),
  )

  if (!word) {
    return <div className="cell empty" aria-hidden="true" />
  }

  const hasPhoto = !!photoUrl
  const cls = [
    'cell',
    marked ? 'marked' : '',
    hasPhoto ? 'has-photo' : '',
    reach ? 'reach' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const style: React.CSSProperties = {}
  if (marked && !hasPhoto) style.background = PALETTE[index % PALETTE.length]

  return (
    <div
      className={cls}
      style={style}
      role="button"
      tabIndex={0}
      aria-pressed={marked}
      aria-label={`${word}${marked ? '（見つけた）' : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle(index)
        }
      }}
      {...handlers}
    >
      {hasPhoto && (
        <>
          <div
            className="photo"
            style={{ backgroundImage: `url(${photoUrl})` }}
          />
          <div className="scrim" />
        </>
      )}
      <span className="txt" style={{ fontSize: fontFor(size) }}>
        {word}
      </span>
    </div>
  )
}

export function PlayScreen({
  board,
  photoUrls,
  onBack,
  onReset,
  onToggle,
  onCamera,
  onOpenSwap,
}: Props) {
  const { bingo, reach } = evaluate(board.size, board.marked)
  const done = board.marked.filter(Boolean).length
  const total = board.words.filter(Boolean).length

  let badgeClass = 'badge'
  let badgeContent: React.ReactNode = 'さがしてみよう'
  if (bingo) {
    badgeClass = 'badge bingo'
    badgeContent = (
      <>
        <BurstIcon />
        ビンゴ！
      </>
    )
  } else if (reach.size) {
    badgeClass = 'badge reach'
    badgeContent = 'あとひとつ！リーチ'
  }

  return (
    <section className="screen" id="play">
      <div className="topbar">
        <button className="back" onClick={onBack} aria-label="作成に戻る">
          ←
        </button>
        <div className="ttl">あそぶ</div>
        <div className="spacer" />
        <button className="reset" onClick={onReset}>
          最初から
        </button>
      </div>
      <div className="status">
        <span className={badgeClass}>{badgeContent}</span>
        <span className="progress">
          {done} / {total} こ
        </span>
      </div>
      <p className="hint">タップ＝見つけた色がつく／長押し＝カメラで写真をはる</p>
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${board.size},1fr)` }}
      >
        {board.words.map((w, i) => (
          <PlayCell
            key={i}
            index={i}
            word={w}
            marked={board.marked[i]}
            photoUrl={photoUrls[i]}
            reach={reach.has(i)}
            size={board.size}
            onToggle={onToggle}
            onCamera={onCamera}
          />
        ))}
      </div>
      <div className="footer-btns">
        <button className="btn ghost" onClick={onOpenSwap}>
          <SwapIcon />
          交換する
        </button>
      </div>
    </section>
  )
}
