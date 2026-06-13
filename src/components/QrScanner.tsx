import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

type Props = {
  onResult: (text: string) => void // QR の中身が読めたら呼ぶ
  onCancel: () => void
}

// カメラ映像から QR コードを連続スキャンする。読めたら onResult。
export function QrScanner({ onResult, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const doneRef = useRef(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const scan = () => {
      const video = videoRef.current
      if (!doneRef.current && video && video.videoWidth && ctx) {
        const w = (canvas.width = video.videoWidth)
        const h = (canvas.height = video.videoHeight)
        ctx.drawImage(video, 0, 0, w, h)
        const img = ctx.getImageData(0, 0, w, h)
        const found = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' })
        if (found && found.data) {
          doneRef.current = true
          stop()
          onResult(found.data)
          return
        }
      }
      rafRef.current = requestAnimationFrame(scan)
    }

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMessage(
          'この端末ではカメラを起動できません。コードを貼りつけて読みこんでください。',
        )
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
        rafRef.current = requestAnimationFrame(scan)
      } catch (e) {
        const name = (e as DOMException)?.name
        if (name === 'NotAllowedError')
          setMessage(
            'カメラの使用が許可されませんでした。設定で許可するか、コードを貼りつけて読みこんでください。',
          )
        else
          setMessage(
            'カメラを起動できませんでした。コードを貼りつけて読みこんでください。',
          )
      }
    }

    start()
    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }

  return (
    <div className="camera">
      <video ref={videoRef} playsInline muted />

      {!message && <div className="qr-frame" aria-hidden="true" />}
      {!message && <p className="qr-hint">友だちのQRコードを枠に合わせてね</p>}

      {message && (
        <div className="cam-msg">
          <p>{message}</p>
        </div>
      )}

      <div className="cam-bar">
        <span />
        <button
          className="cam-text right"
          onClick={() => {
            stop()
            onCancel()
          }}
        >
          とじる
        </button>
      </div>
    </div>
  )
}
