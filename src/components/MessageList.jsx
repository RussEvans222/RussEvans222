import { useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

function formatLabel(isoStr) {
  const d = new Date(isoStr)
  const now = new Date()
  const diffMs = now - d

  if (diffMs < 60000) return 'Just now'

  const isToday = d.toDateString() === now.toDateString()
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  if (isToday) return `Today ${timeStr}`

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${timeStr}`

  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ` ${timeStr}`
}

export default function MessageList({ messages, isTyping, persona }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isTyping])

  // Annotate each message with its position within a consecutive sender group
  const annotated = messages.map((msg, i) => {
    const prev = messages[i - 1]
    const next = messages[i + 1]
    const samePrev = prev?.sender === msg.sender
    const sameNext = next?.sender === msg.sender

    let position
    if (!samePrev && !sameNext) position = 'only'
    else if (!samePrev) position = 'first'
    else if (sameNext) position = 'mid'
    else position = 'last'

    // Show a time label when gap > 5 min or at start
    const showLabel = !prev || (new Date(msg.time) - new Date(prev.time)) > 5 * 60 * 1000

    return { ...msg, position, showLabel }
  })

  const ins = persona.name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="messages-area">
      {annotated.map((msg) => (
        <div key={msg.id}>
          {msg.showLabel && (
            <div className="time-label">{formatLabel(msg.time)}</div>
          )}
          <MessageBubble msg={msg} contactInitials={ins} />
        </div>
      ))}

      {isTyping && <TypingIndicator contactInitials={ins} />}

      <div ref={bottomRef} style={{ height: 4 }} />
    </div>
  )
}
