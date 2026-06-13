import { ShareIcon } from '../icons'

type Props = {
  previewUrl: string | null
  onShare: () => void
  onSaveImg: () => void
  onLine: () => void
  onX: () => void
  onSaveCard: () => void
  saved: boolean
  onClose: () => void
}

export function Celebrate({
  previewUrl,
  onShare,
  onSaveImg,
  onLine,
  onX,
  onSaveCard,
  saved,
  onClose,
}: Props) {
  return (
    <div className="celebrate">
      <div className="bingo-word">BINGO!</div>
      <p>
        おめでとう！
        <br />
        みんなにじまんしよう
      </p>
      {previewUrl && (
        <img
          className="card-preview"
          src={previewUrl}
          alt="できたビンゴカード"
        />
      )}
      <button className="btn coral" onClick={onShare}>
        <ShareIcon />
        シェアする
      </button>
      <button
        className="btn mint"
        onClick={onSaveCard}
        disabled={saved}
      >
        {saved ? '保存した！' : 'このビンゴを保存'}
      </button>
      <div className="share-alt">
        <button onClick={onSaveImg}>画像を保存</button>
        <button onClick={onLine}>LINE</button>
        <button onClick={onX}>X</button>
      </div>
      <button className="close" onClick={onClose}>
        とじる
      </button>
    </div>
  )
}
