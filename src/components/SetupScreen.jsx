import { useState } from 'react'

export default function SetupScreen({ initial, onSave, isFirstTime }) {
  const [form, setForm] = useState({ ...initial })

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const canSave = form.name.trim() && form.friendName.trim()

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <div className="setup-title">
          {isFirstTime ? 'Set Up Chat' : 'Settings'}
        </div>
        <div className="setup-subtitle">
          {isFirstTime
            ? 'Configure who your daughter thinks she\'s texting'
            : 'Adjust the conversation settings'}
        </div>
      </div>

      <div className="setup-body">
        <div className="setup-section">
          <div className="setup-section-title">Their Contact (Friend's Son)</div>
          <div className="setup-card">
            <div className="setup-row">
              <label className="setup-label">Name</label>
              <input
                className="setup-input"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Tyler"
              />
            </div>
            <div className="setup-row">
              <label className="setup-label">Age</label>
              <input
                className="setup-input"
                value={form.age}
                onChange={e => set('age', e.target.value)}
                placeholder="14"
                type="number"
                min="8"
                max="18"
              />
            </div>
            <div className="setup-row setup-row-col">
              <label className="setup-label">Personality &amp; Interests</label>
              <textarea
                className="setup-textarea"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Friendly, funny, loves video games and basketball..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="setup-section">
          <div className="setup-section-title">Your Daughter</div>
          <div className="setup-card">
            <div className="setup-row">
              <label className="setup-label">Her Name</label>
              <input
                className="setup-input"
                value={form.friendName}
                onChange={e => set('friendName', e.target.value)}
                placeholder="Emma"
              />
            </div>
            <div className="setup-row">
              <label className="setup-label">Her Age</label>
              <input
                className="setup-input"
                value={form.friendAge}
                onChange={e => set('friendAge', e.target.value)}
                placeholder="13"
                type="number"
                min="8"
                max="18"
              />
            </div>
          </div>
        </div>

        <div className="setup-section">
          <div className="setup-section-title">Extra Context (Optional)</div>
          <div className="setup-card">
            <div className="setup-row setup-row-col">
              <label className="setup-label">Additional Notes</label>
              <textarea
                className="setup-textarea"
                value={form.extraContext}
                onChange={e => set('extraContext', e.target.value)}
                placeholder="They met at soccer camp. They both like Taylor Swift..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <button
          className="setup-save-btn"
          onClick={() => onSave(form)}
          disabled={!canSave}
        >
          {isFirstTime ? 'Start Chat' : 'Save & Return'}
        </button>
      </div>
    </div>
  )
}
