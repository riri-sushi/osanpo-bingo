import { useEffect, useRef, useState } from 'react'
import type { BoardState, Screen, Size } from './types'
import { evaluate } from './bingo'
import {
  saveBoard,
  loadBoard,
  clearBoard,
  clearPhotos,
  putPhoto,
  deletePhoto,
  loadPhotoUrls,
} from './storage'
import { encodeCard, decodeCard } from './swap'
import { makeCardImage } from './boardImage'
import { popConfetti } from './confetti'
import { shareCard, saveImage, shareToLine, shareToX } from './share'
import { Home } from './components/Home'
import { EditScreen } from './components/EditScreen'
import { PlayScreen } from './components/PlayScreen'
import { EditorSheet } from './components/EditorSheet'
import { SwapSheet } from './components/SwapSheet'
import { Celebrate } from './components/Celebrate'
import { CameraSheet } from './components/CameraSheet'

const SCREEN_KEY = 'osanpo-bingo:screen'

function newBoard(size: Size): BoardState {
  const n = size * size
  return {
    size,
    words: Array(n).fill(''),
    marked: Array(n).fill(false),
    photoIds: Array(n).fill(null),
  }
}

function makeId(): string {
  if (crypto.randomUUID) return crypto.randomUUID()
  return 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [board, setBoard] = useState<BoardState>(() => newBoard(3))
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({})
  const [editorIndex, setEditorIndex] = useState<number | null>(null)
  const [swapOpen, setSwapOpen] = useState(false)
  const [cameraIndex, setCameraIndex] = useState<number | null>(null)
  const [celebrateOpen, setCelebrateOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const celebrated = useRef(false)
  const cardBlob = useRef<Blob | null>(null)
  const fxCanvas = useRef<HTMLCanvasElement>(null)
  const phoneEl = useRef<HTMLDivElement>(null)
  const stopConfetti = useRef<(() => void) | undefined>(undefined)

  // ── 復元：ブラウザを閉じても続きから ──
  useEffect(() => {
    const saved = loadBoard()
    if (saved) {
      setBoard(saved)
      const s = localStorage.getItem(SCREEN_KEY) as Screen | null
      setScreen(s === 'play' || s === 'edit' ? s : 'edit')
      // すでにビンゴ済みの盤面を復元した場合は演出を再発火しない
      if (evaluate(saved.size, saved.marked).bingo) celebrated.current = true
      loadPhotoUrls(saved.photoIds).then(setPhotoUrls)
    }
    setLoaded(true)
  }, [])

  // ── 自動保存 ──
  useEffect(() => {
    if (!loaded) return
    saveBoard(board)
  }, [board, loaded])
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(SCREEN_KEY, screen)
  }, [screen, loaded])

  // ── ビンゴ初成立時のみ演出を発火 ──
  useEffect(() => {
    if (screen !== 'play') return
    const { bingo } = evaluate(board.size, board.marked)
    if (bingo && !celebrated.current) {
      celebrated.current = true
      setCelebrateOpen(true)
      // 紙吹雪
      if (fxCanvas.current && phoneEl.current) {
        stopConfetti.current?.()
        stopConfetti.current = popConfetti(fxCanvas.current, phoneEl.current)
      }
      // 盤面プレビュー画像を生成
      makeCardImage(board, photoUrls)
        .then((blob) => {
          cardBlob.current = blob
          setPreviewUrl((old) => {
            if (old) URL.revokeObjectURL(old)
            return URL.createObjectURL(blob)
          })
        })
        .catch(() => {})
    }
  }, [board, screen, photoUrls])

  // ── ホーム：サイズ選択＝新しいカード ──
  const pickSize = (size: Size) => {
    clearPhotos()
    setPhotoUrls({})
    setBoard(newBoard(size))
    celebrated.current = false
    setScreen('edit')
  }

  // ── マスの入力 ──
  const saveCell = (value: string) => {
    if (editorIndex === null) return
    setBoard((b) => {
      const words = b.words.slice()
      words[editorIndex] = value
      return { ...b, words }
    })
    setEditorIndex(null)
  }

  const goPlay = () => {
    if (board.words.every((w) => !w)) {
      alert('マスをひとつは書いてね！')
      return
    }
    setScreen('play')
  }

  // ── マーク（タップ） ──
  const toggleMark = (i: number) => {
    setBoard((b) => {
      const marked = b.marked.slice()
      marked[i] = !marked[i]
      const photoIds = b.photoIds.slice()
      if (!marked[i] && photoIds[i]) {
        // マーク解除でその写真も消す
        deletePhoto(photoIds[i]!)
        photoIds[i] = null
        setPhotoUrls((p) => {
          const next = { ...p }
          delete next[i]
          return next
        })
      }
      return { ...b, marked, photoIds }
    })
  }

  // ── カメラ撮影 ──
  const onCapture = async (dataUrl: string) => {
    const i = cameraIndex
    setCameraIndex(null)
    if (i === null) return
    const id = makeId()
    try {
      await putPhoto(id, dataUrl)
    } catch {
      /* 保存に失敗しても表示は継続 */
    }
    setPhotoUrls((p) => ({ ...p, [i]: dataUrl }))
    setBoard((b) => {
      const photoIds = b.photoIds.slice()
      const marked = b.marked.slice()
      photoIds[i] = id
      marked[i] = true // 写真マスはマーク済み扱い
      return { ...b, photoIds, marked }
    })
  }

  // ── 交換コード読み込み ──
  const loadCode = (codeIn: string): boolean => {
    try {
      const { size, words } = decodeCard(codeIn)
      clearPhotos()
      setPhotoUrls({})
      celebrated.current = false
      setBoard({
        size,
        words,
        marked: Array(size * size).fill(false),
        photoIds: Array(size * size).fill(null),
      })
      setSwapOpen(false)
      setScreen('edit')
      return true
    } catch {
      return false
    }
  }

  // ── リセット（新しいカードを作り直す） ──
  const reset = () => {
    if (!confirm('いまのカードを消して、最初からはじめますか？')) return
    clearBoard()
    clearPhotos()
    setPhotoUrls({})
    setBoard(newBoard(3))
    celebrated.current = false
    setCelebrateOpen(false)
    setScreen('home')
  }

  const closeCelebrate = () => {
    setCelebrateOpen(false)
    celebrated.current = false
    stopConfetti.current?.()
  }

  const doShare = async () => {
    if (!cardBlob.current) {
      try {
        cardBlob.current = await makeCardImage(board, photoUrls)
      } catch {
        alert('画像を作れませんでした。もう一度お試しください。')
        return
      }
    }
    const result = await shareCard(cardBlob.current)
    if (result === 'fallback-saved')
      alert(
        'この端末は画像の直接シェアに未対応のため、画像を保存しました。LINE / X に手動で添付してください。',
      )
  }

  const code = encodeCard(board.size, board.words)

  return (
    <div className="phone" ref={phoneEl}>
      <div className="notch" />

      {screen === 'home' && <Home onPick={pickSize} />}
      {screen === 'edit' && (
        <EditScreen
          board={board}
          onBack={() => setScreen('home')}
          onReset={reset}
          onEditCell={setEditorIndex}
          onPlay={goPlay}
          onOpenSwap={() => setSwapOpen(true)}
        />
      )}
      {screen === 'play' && (
        <PlayScreen
          board={board}
          photoUrls={photoUrls}
          onBack={() => setScreen('edit')}
          onReset={reset}
          onToggle={toggleMark}
          onCamera={setCameraIndex}
          onOpenSwap={() => setSwapOpen(true)}
        />
      )}

      {celebrateOpen && (
        <Celebrate
          previewUrl={previewUrl}
          onShare={doShare}
          onSaveImg={() => cardBlob.current && saveImage(cardBlob.current)}
          onLine={shareToLine}
          onX={shareToX}
          onClose={closeCelebrate}
        />
      )}

      {editorIndex !== null && (
        <EditorSheet
          key={editorIndex}
          initialValue={board.words[editorIndex] ?? ''}
          onCancel={() => setEditorIndex(null)}
          onSave={saveCell}
        />
      )}

      {swapOpen && (
        <SwapSheet code={code} onClose={() => setSwapOpen(false)} onLoad={loadCode} />
      )}

      {cameraIndex !== null && (
        <CameraSheet onCapture={onCapture} onCancel={() => setCameraIndex(null)} />
      )}

      <canvas className="fx" ref={fxCanvas} />
    </div>
  )
}
