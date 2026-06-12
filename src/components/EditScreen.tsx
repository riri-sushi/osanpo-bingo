import { fontFor } from '../constants'
import type { BoardState } from '../types'
import { SwapIcon } from '../icons'

type Props = {
  board: BoardState
  onBack: () => void
  onReset: () => void
  onEditCell: (index: number) => void
  onPlay: () => void
  onOpenSwap: () => void
}

export function EditScreen({
  board,
  onBack,
  onReset,
  onEditCell,
  onPlay,
  onOpenSwap,
}: Props) {
  return (
    <section className="screen" id="edit">
      <div className="topbar">
        <button className="back" onClick={onBack} aria-label="ホームに戻る">
          ←
        </button>
        <div className="ttl">カードを作る</div>
        <div className="spacer" />
        <button className="reset" onClick={onReset}>
          最初から
        </button>
      </div>
      <p className="hint">マスをタップして、見つけたいものを書こう（50文字まで）</p>
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${board.size},1fr)` }}
      >
        {board.words.map((w, i) => (
          <div
            key={i}
            className={'cell' + (w ? '' : ' empty')}
            role="button"
            tabIndex={0}
            onClick={() => onEditCell(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onEditCell(i)
              }
            }}
          >
            {w ? (
              <span className="txt" style={{ fontSize: fontFor(board.size) }}>
                {w}
              </span>
            ) : (
              <span className="add">＋</span>
            )}
          </div>
        ))}
      </div>
      <div className="footer-btns">
        <button className="btn coral" onClick={onPlay}>
          できた！あそぶ →
        </button>
        <button className="btn ghost" onClick={onOpenSwap}>
          <SwapIcon />
          友だちと交換する
        </button>
      </div>
    </section>
  )
}
