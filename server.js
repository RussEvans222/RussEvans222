import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(join(__dirname, 'dist')))

app.post('/api/chat', async (req, res) => {
  const { message, history, persona } = req.body

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in .env' })
  }

  const client = new Anthropic({ apiKey })

  const systemPrompt = `You are ${persona.name}, a ${persona.age}-year-old kid texting your friend ${persona.friendName} (age ${persona.friendAge}).

About you: ${persona.description}${persona.extraContext ? `\n\nExtra context: ${persona.extraContext}` : ''}

RULES — follow these exactly:
- Text like a real ${persona.age}-year-old. Short messages, 1-2 sentences MAX, often just a few words.
- Mostly lowercase. Minimal punctuation. No "Dear" or formal language ever.
- Use natural teen abbreviations: lol, omg, fr, ngl, tbh, rn, nvm, idk, lmao, bruh, lowkey, no cap, etc.
- Emoji are fine but don't overdo it — 0-1 per message usually.
- React naturally to what ${persona.friendName} says. Ask follow-up questions sometimes.
- You are NEVER an AI. You are always ${persona.name}. Never break character.
- If asked something personal, answer as ${persona.name} would based on your description.`

  // Build message history for the API
  const formattedHistory = (history || [])
    .filter(m => m.sender === 'me' || m.sender === 'them')
    .slice(-20)
    .map(m => ({
      role: m.sender === 'me' ? 'user' : 'assistant',
      content: m.text
    }))

  // API requires first message to be 'user' and roles must alternate
  while (formattedHistory.length > 0 && formattedHistory[0].role === 'assistant') {
    formattedHistory.shift()
  }
  const cleanHistory = formattedHistory.reduce((acc, msg) => {
    if (acc.length === 0 || acc[acc.length - 1].role !== msg.role) {
      acc.push(msg)
    }
    return acc
  }, [])

  // Remove trailing user messages since we'll add the current one
  while (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === 'user') {
    cleanHistory.pop()
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 120,
      system: systemPrompt,
      messages: [
        ...cleanHistory,
        { role: 'user', content: message }
      ]
    })

    const reply = response.content[0].text.trim()
    res.json({ reply })
  } catch (err) {
    console.error('Anthropic API error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Serve the React app for all other routes (production)
app.get('*', (req, res) => {
  const indexPath = join(__dirname, 'dist', 'index.html')
  res.sendFile(indexPath, err => {
    if (err) res.status(404).send('Run "npm run build" first to generate the dist folder.')
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`✅ iMessage Simulator running → http://localhost:${PORT}`)
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.')
  }
})
