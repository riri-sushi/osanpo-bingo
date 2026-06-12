import { useState } from 'react'
import { charLen, MAX_LEN } from '../constants'

type Props = {
  initialValue: string
  onCancel: () => void
  onSave: (value: string) => void
}

export function EditorSheet({ initialValue, onCancel, onSave }: Props) {
  const [value, setValue] = useState(initialValue)
  const len = charLen(value)
  const over = len > MAX_LEN

  return (
    <div className="editor" onClick={onCancel}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h3>このマスに書く</h3>
        <textarea
          autoFocus
          maxLength={60}
          placeholder="例：赤い花 / ねこ / まるいポスト"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className={'counter' + (over ? ' over' : '')}>
          {len} / {MAX_LEN}
        </div>
        <div className="btn-row">
          <button className="btn ghost" onClick={onCancel}>
            やめる
          </button>
          <button
            className="btn mint"
            disabled={over}
            onClick={() => onSave(value.trim())}
          >
            きめる
          </button>
        </div>
      </div>
    </div>
  )
}
