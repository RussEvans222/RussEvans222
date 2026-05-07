import { useState, useEffect } from 'react'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

function makeId() {
  return Math.random().toString(36).slice(2)
}

export default function ChatView({ persona, onOpenSettings }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('imsg-messages')
      if (saved) return JSON.parse(saved)
    } catch { /* ignore */ }
    return [
      {
        id: makeId(),
        text: `hey ${persona.friendName}! 👋`,
        sender: 'them',
        time: new Date().toISOString()
      }
    ]
  })
  const [isTyping, setIsTyping] = useState(false)
  // isBusy covers both the silent reading phase AND the typing-dots phase
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    localStorage.setItem('imsg-messages', JSON.stringify(messages))
  }, [messages])

  const clearChat = () => {
    const fresh = [{
      id: makeId(),
      text: `hey ${persona.friendName}! 👋`,
      sender: 'them',
      time: new Date().toISOString()
    }]
    setMessages(fresh)
  }

  const sendMessage = async (text) => {
    const myMsg = {
      id: makeId(),
      text,
      sender: 'me',
      time: new Date().toISOString(),
      status: 'delivered'
    }
    const updated = [...messages, myMsg]
    setMessages(updated)
    setIsBusy(true)

    // Fire the API call immediately so it runs in the background
    const responsePromise = fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: updated, persona })
    }).then(r => r.json()).catch(() => ({ reply: null }))

    // Phase 1 — silent reading delay (2–20 s): they received the message, reading it
    const readDelay = 2000 + Math.random() * 18000
    await new Promise(r => setTimeout(r, readDelay))

    // Phase 2 — typing dots visible (3–10 s): show dots, wait for min type time + API
    setIsTyping(true)
    const typeDelay = 3000 + Math.random() * 7000

    let data
    try {
      // Wait for BOTH the minimum typing duration AND the actual API response
      ;[data] = await Promise.all([
        responsePromise,
        new Promise(r => setTimeout(r, typeDelay))
      ])
    } catch {
      data = { reply: null }
    }

    setIsTyping(false)
    setIsBusy(false)

    const reply = data?.reply || ''
    const imageUrl = data?.imageUrl || null
    const text = reply || (!imageUrl ? 'lol sorry one sec' : '')

    setMessages(prev => [
      ...prev.map(m => m.id === myMsg.id ? { ...m, status: 'read' } : m),
      { id: makeId(), text, imageUrl, sender: 'them', time: new Date().toISOString() }
    ])
  }

  return (
    <>
      <ChatHeader persona={persona} onSettings={onOpenSettings} onClearChat={clearChat} />
      <MessageList messages={messages} isTyping={isTyping} persona={persona} />
      <MessageInput onSend={sendMessage} disabled={isBusy} />
    </>
  )
}
