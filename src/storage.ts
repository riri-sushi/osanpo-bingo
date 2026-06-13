import type { BoardState, SavedCard } from './types'

// ── 軽量データ（サイズ・文字・マーク・写真キー）は localStorage に保存 ──
const BOARD_KEY = 'osanpo-bingo:board'

export function saveBoard(board: BoardState) {
  try {
    localStorage.setItem(BOARD_KEY, JSON.stringify(board))
  } catch {
    /* 保存失敗時は黙って無視（プレイは続行できる） */
  }
}

export function loadBoard(): BoardState | null {
  try {
    const raw = localStorage.getItem(BOARD_KEY)
    if (!raw) return null
    const b = JSON.parse(raw) as BoardState
    if (![3, 4, 5].includes(b.size)) return null
    const n = b.size * b.size
    if (!Array.isArray(b.words) || b.words.length !== n) return null
    // 旧データの保険として配列長をそろえる
    b.marked = Array.from({ length: n }, (_, i) => !!b.marked?.[i])
    b.photoIds = Array.from({ length: n }, (_, i) => b.photoIds?.[i] ?? null)
    return b
  } catch {
    return null
  }
}

export function clearBoard() {
  try {
    localStorage.removeItem(BOARD_KEY)
  } catch {
    /* ignore */
  }
}

// ── 写真データは重いので IndexedDB に保存（localStorage の容量上限を避ける）──
const DB_NAME = 'osanpo-bingo'
const STORE = 'photos'
const SAVED_STORE = 'saved' // やり切ったビンゴ（画像＋メタ）

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
      if (!db.objectStoreNames.contains(SAVED_STORE))
        db.createObjectStore(SAVED_STORE, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function putPhoto(id: string, dataUrl: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(dataUrl, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPhoto(id: string): Promise<string | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(id)
    req.onsuccess = () => resolve((req.result as string) ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => resolve()
  })
}

export async function clearPhotos(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => resolve()
  })
}

// photoIds に対応する dataURL をまとめて読み込む（index -> dataURL）
export async function loadPhotoUrls(
  photoIds: (string | null)[],
): Promise<Record<number, string>> {
  const out: Record<number, string> = {}
  await Promise.all(
    photoIds.map(async (id, i) => {
      if (!id) return
      const url = await getPhoto(id).catch(() => null)
      if (url) out[i] = url
    }),
  )
  return out
}

// ── やり切ったビンゴの保存・一覧・削除 ──
export async function saveCompleted(card: SavedCard): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SAVED_STORE, 'readwrite')
    tx.objectStore(SAVED_STORE).put(card)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function listSaved(): Promise<SavedCard[]> {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(SAVED_STORE, 'readonly')
    const req = tx.objectStore(SAVED_STORE).getAll()
    req.onsuccess = () => {
      const cards = (req.result as SavedCard[]) ?? []
      // 新しい順
      cards.sort((a, b) => b.createdAt - a.createdAt)
      resolve(cards)
    }
    req.onerror = () => resolve([])
  })
}

export async function deleteSaved(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(SAVED_STORE, 'readwrite')
    tx.objectStore(SAVED_STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => resolve()
  })
}
