import { useState, useEffect, useRef } from 'react'

function getTime() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function initials(name) {
  return name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function ChatHeader({ persona, onSettings, onClearChat }) {
  const [time, setTime] = useState(getTime)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setTime(getTime()), 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="chat-header">
      {/* Status bar */}
      <div className="status-bar">
        <span className="status-time">{time}</span>
        <div className="status-icons">
          <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
            <rect x="0" y="3" width="3" height="9" rx="1" opacity="0.3"/>
            <rect x="4.5" y="2" width="3" height="10" rx="1" opacity="0.6"/>
            <rect x="9" y="0" width="3" height="12" rx="1"/>
            <rect x="13.5" y="0" width="3" height="12" rx="1"/>
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
            <path d="M8 2.4A8.5 8.5 0 0 1 14.6 5l1.4-1.4A10.5 10.5 0 0 0 8 0a10.5 10.5 0 0 0-8 3.6L1.4 5A8.5 8.5 0 0 1 8 2.4z"/>
            <path d="M8 5.8A5 5 0 0 1 11.6 7.2l1.4-1.4A7 7 0 0 0 8 3.4a7 7 0 0 0-5 2.4l1.4 1.4A5 5 0 0 1 8 5.8z"/>
            <circle cx="8" cy="10" r="2"/>
          </svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
            <rect x="0" y="1" width="21" height="10" rx="3.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.35"/>
            <rect x="22" y="4" width="3" height="4" rx="1" opacity="0.4"/>
            <rect x="1.5" y="2.5" width="17" height="7" rx="2" fill="currentColor"/>
          </svg>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="nav-bar">
        <button className="back-btn" aria-label="Back to Messages">
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none" aria-hidden="true">
            <path d="M9 1L1 9L9 17" stroke="#007AFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>3</span>
        </button>

        <button className="contact-center" onClick={() => setMenuOpen(v => !v)} aria-label="Contact info">
          <div className="contact-avatar">{initials(persona.name)}</div>
          <div className="contact-name">{persona.name}</div>
          <div className="contact-label">iMessage</div>
        </button>

        <div className="header-actions" ref={menuRef}>
          <button
            className="icon-btn"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="More options"
            aria-expanded={menuOpen}
          >
            <svg width="4" height="18" viewBox="0 0 4 18" fill="currentColor">
              <circle cx="2" cy="2" r="2"/>
              <circle cx="2" cy="9" r="2"/>
              <circle cx="2" cy="16" r="2"/>
            </svg>
          </button>

          {menuOpen && (
            <div className="dropdown-menu" role="menu">
              <button
                className="dropdown-item"
                role="menuitem"
                onClick={() => { onSettings(); setMenuOpen(false) }}
              >
                <span>⚙️</span> Settings
              </button>
              <button
                className="dropdown-item dropdown-item-danger"
                role="menuitem"
                onClick={() => {
                  if (window.confirm('Clear all messages?')) {
                    onClearChat()
                    setMenuOpen(false)
                  }
                }}
              >
                <span>🗑️</span> Clear Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
