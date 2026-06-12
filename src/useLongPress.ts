import { useRef } from 'react'

// ポインタ長押し（約500ms）でカメラ、短押しでマークのトグル。
// 長押しが発火したらタップ（短押し）は誤発火させない。
export function useLongPress(
  onTap: () => void,
  onLongPress: () => void,
  ms = 500,
) {
  const timer = useRef<number | null>(null)
  const longFired = useRef(false)

  const clear = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }

  return {
    onPointerDown: () => {
      longFired.current = false
      clear()
      timer.current = window.setTimeout(() => {
        longFired.current = true
        onLongPress()
      }, ms)
    },
    onPointerUp: () => {
      clear()
      if (!longFired.current) onTap()
    },
    onPointerLeave: clear,
    onPointerCancel: clear,
  }
}
