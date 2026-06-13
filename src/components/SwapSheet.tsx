import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { QrScanner } from './QrScanner'

type Props = {
  code: string // 自分のカードコード
  onClose: () => void
  onLoad: (codeIn: string) => boolean // 読み込み成功で true、失敗で false
}

export function SwapSheet({ code, onClose, onLoad }: Props) {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [qrError, setQrError] = useState(false)
  const [scanning, setScanning] = useState(false)

  // 自分のカードコードを QR 画像に変換（大きすぎて収まらない場合は qrError）
  useEffect(() => {
    let alive = true
    setQrError(false)
    QRCode.toDataURL(code, {
      errorCorrectionLevel: 'L',
      margin: 2,
      width: 320,
      color: { dark: '#2B2D42', light: '#FFFFFF' },
    })
      .then((url) => alive && setQrUrl(url))
      .catch(() => alive && setQrError(true))
    return () => {
      alive = false
    }
  }, [code])

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

  const tryLoad = (value: string): boolean => {
    const ok = onLoad(value)
    if (!ok)
      setError(
        'コードを読みこめませんでした。コード全体が正しいか、QRをもう一度読み取ってください。',
      )
    return ok
  }

  const load = () => {
    if (!input.trim()) {
      setError('コードを貼りつけてください。')
      return
    }
    tryLoad(input)
  }

  const onScan = (text: string) => {
    setScanning(false)
    setInput(text)
    tryLoad(text)
  }

  return (
    <div className="editor" onClick={onClose}>
      <div className="sheet swap" onClick={(e) => e.stopPropagation()}>
        <h3>カードを交換する</h3>

        <label>あなたのカード（友だちに見せる／送る）</label>
        <div className="qr-box">
          {qrError ? (
            <p className="note">
              マスが多くてQRに収まりませんでした。下のコードをコピーして送ってください。
            </p>
          ) : qrUrl ? (
            <img className="qr-img" src={qrUrl} alt="あなたのカードのQRコード" />
          ) : (
            <p className="note">QRを作っています…</p>
          )}
        </div>

        <details className="code-fold">
          <summary>コードで送る（コピーして貼りつけ）</summary>
          <textarea readOnly value={code} />
          <div className="btn-row" style={{ marginTop: 8 }}>
            <button className="btn sky" onClick={copy}>
              {copied ? 'コピーした！' : 'コードをコピー'}
            </button>
          </div>
        </details>

        <p className="note">※写真は含まれません（文字とサイズのみ）。</p>

        <label>友だちのカードをもらう</label>
        <div className="btn-row">
          <button className="btn coral" onClick={() => setScanning(true)}>
            QRを読みこむ
          </button>
        </div>
        <textarea
          placeholder="または、もらったコードをここに貼りつけ"
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
          <button className="btn sun" onClick={load}>
            コードをよみこむ
          </button>
        </div>
      </div>

      {scanning && (
        <QrScanner onResult={onScan} onCancel={() => setScanning(false)} />
      )}
    </div>
  )
}
