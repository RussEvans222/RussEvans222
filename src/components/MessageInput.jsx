import { useState, useRef } from 'react'

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('')
  const ref = useRef(null)

  const submit = () => {
    const val = text.trim()
    if (!val || disabled) return
    onSend(val)
    setText('')
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.focus()
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const onInput = (e) => {
    setText(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 108) + 'px'
  }

  const hasText = text.trim().length > 0

  return (
    <div className="input-bar">
      <button className="input-icon-btn" aria-label="Apps" tabIndex={-1}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="10" stroke="#007AFF" strokeWidth="1.8"/>
          <path d="M7 11h8M11 7v8" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>

      <div className="input-field-wrap">
        <textarea
          ref={ref}
          className="input-textarea"
          value={text}
          onChange={onInput}
          onKeyDown={onKeyDown}
          placeholder="iMessage"
          rows={1}
          disabled={disabled}
          aria-label="Message"
        />
        {hasText && (
          <button
            className="send-btn"
            onClick={submit}
            disabled={disabled}
            aria-label="Send message"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 12V2M7 2L2 7M7 2L12 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
