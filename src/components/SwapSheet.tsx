import { useState } from 'react'

type Props = {
  code: string // 自分のカードコード
  onClose: () => void
  onLoad: (codeIn: string) => boolean // 読み込み成功で true、失敗で false
}

export function SwapSheet({ code, onClose, onLoad }: Props) {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      setError(
        'コピーできませんでした。コードを長押しして手動でコピーしてください。',
      )
    }
  }

  const load = () => {
    if (!input.trim()) {
      setError('コードを貼りつけてください。')
      return
    }
    const ok = onLoad(input)
    if (!ok)
      setError(
        'コードを読みこめませんでした。コード全体が正しく貼られているか確認してください。',
      )
  }

  return (
    <div className="editor" onClick={onClose}>
      <div className="sheet swap" onClick={(e) => e.stopPropagation()}>
        <h3>カードを交換する</h3>
        <label htmlFor="swapOut">あなたのカードコード（コピーして送る）</label>
        <textarea id="swapOut" readOnly value={code} />
        <p className="note">※写真はコードに含まれません（文字とサイズのみ）。</p>
        <div className="btn-row" style={{ marginTop: 8 }}>
          <button className="btn sky" onClick={copy}>
            {copied ? 'コピーした！' : 'コピー'}
          </button>
        </div>
        <label htmlFor="swapIn">もらったコードを貼って読みこむ</label>
        <textarea
          id="swapIn"
          placeholder="ここに貼りつけ"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError('')
          }}
        />
        {error && <p className="error">{error}</p>}
        <div className="btn-row" style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={onClose}>
            とじる
          </button>
          <button className="btn coral" onClick={load}>
            よみこむ
          </button>
        </div>
      </div>
    </div>
  )
}
