import { useState, useEffect } from 'react'
import SetupScreen from './components/SetupScreen'
import ChatView from './components/ChatView'

const DEFAULT_PERSONA = {
  name: 'Tyler',
  age: '14',
  description: 'friendly, funny, loves video games (Fortnite, NBA 2K), sports, and memes. Pretty laid-back.',
  friendName: 'Emma',
  friendAge: '13',
  extraContext: ''
}

export default function App() {
  const [persona, setPersona] = useState(null)
  const [showSetup, setShowSetup] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('imsg-persona')
    if (saved) {
      try { setPersona(JSON.parse(saved)) } catch { setShowSetup(true) }
    } else {
      setShowSetup(true)
    }
    setReady(true)
  }, [])

  const handleSave = (data) => {
    localStorage.setItem('imsg-persona', JSON.stringify(data))
    // Clear old chat when persona changes
    if (!persona || persona.name !== data.name) {
      localStorage.removeItem('imsg-messages')
    }
    setPersona(data)
    setShowSetup(false)
  }

  if (!ready) return null

  if (showSetup || !persona) {
    return (
      <div className="app-shell">
        <SetupScreen
          initial={persona || DEFAULT_PERSONA}
          onSave={handleSave}
          isFirstTime={!persona}
        />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <ChatView persona={persona} onOpenSettings={() => setShowSetup(true)} />
    </div>
  )
}
