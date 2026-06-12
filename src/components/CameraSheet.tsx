import { useEffect, useRef, useState } from 'react'
import { captureSquareFromVideo, captureSquareFromFile } from '../imaging'
import { CameraIcon } from '../icons'

type Props = {
  onCapture: (dataUrl: string) => void
  onCancel: () => void
}

export function CameraSheet({ onCapture, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    // 第一候補：getUserMedia による撮影UI（背面カメラ優先）
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMessage(
          'この端末ではカメラを直接起動できません。「写真を選ぶ」から撮影・選択してください。',
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
        setReady(true)
      } catch (e) {
        // 権限拒否・非対応：分かりやすく案内し、ファイル選択に切り替え
        const name = (e as DOMException)?.name
        if (name === 'NotAllowedError')
          setMessage(
            'カメラの使用が許可されませんでした。設定で許可するか、「写真を選ぶ」から選んでください。',
          )
        else
          setMessage(
            'カメラを起動できませんでした。「写真を選ぶ」から撮影・選択してください。',
          )
      }
    }
    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const stop = () => streamRef.current?.getTracks().forEach((t) => t.stop())

  const shoot = () => {
    if (!videoRef.current || !videoRef.current.videoWidth) return
    const dataUrl = captureSquareFromVideo(videoRef.current)
    stop()
    onCapture(dataUrl)
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const dataUrl = await captureSquareFromFile(f)
      stop()
      onCapture(dataUrl)
    } catch {
      setMessage('画像を読み込めませんでした。別の写真でお試しください。')
    }
  }

  return (
    <div className="camera">
      <video ref={videoRef} playsInline muted />

      {message && (
        <div className="cam-msg">
          <CameraIcon className="ico" />
          <p>{message}</p>
          <button
            className="btn sun"
            style={{ maxWidth: 240 }}
            onClick={() => fileRef.current?.click()}
          >
            写真を選ぶ
          </button>
        </div>
      )}

      <div className="cam-bar">
        <button className="cam-text" onClick={() => fileRef.current?.click()}>
          写真を選ぶ
        </button>
        {ready && (
          <button
            className="shutter"
            onClick={shoot}
            aria-label="シャッター"
          />
        )}
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

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={onFile}
      />
    </div>
  )
}
