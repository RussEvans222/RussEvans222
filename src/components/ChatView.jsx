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

    // Realistic typing delay: 1–4 seconds, weighted by message length
    const delay = 1200 + Math.random() * 2800
    setIsTyping(true)

    await new Promise(r => setTimeout(r, delay))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: updated, persona })
      })
      const data = await res.json()
      const reply = data.reply || 'lol sorry one sec'

      setMessages(prev =>
        prev
          .map(m => m.id === myMsg.id ? { ...m, status: 'read' } : m)
          .concat({
            id: makeId(),
            text: reply,
            sender: 'them',
            time: new Date().toISOString()
          })
      )
    } catch {
      // Fallback feels natural if API is down
      setMessages(prev =>
        prev
          .map(m => m.id === myMsg.id ? { ...m, status: 'read' } : m)
          .concat({
            id: makeId(),
            text: 'lol hold on my phone is being weird',
            sender: 'them',
            time: new Date().toISOString()
          })
      )
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      <ChatHeader persona={persona} onSettings={onOpenSettings} onClearChat={clearChat} />
      <MessageList messages={messages} isTyping={isTyping} persona={persona} />
      <MessageInput onSend={sendMessage} disabled={isTyping} />
    </>
  )
}
