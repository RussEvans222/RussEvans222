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

function ageStyle(age) {
  const n = parseInt(age) || 13
  if (n <= 9)  return 'Write very simply — short sentences, easy everyday words. Use basic emoji like 😊 👋 😄. Talk about cartoons, games, pets, school, food. Never use slang or abbreviations a young child would not know.'
  if (n <= 11) return 'Write casually and short. Use "lol", "omg", "idk", "haha", "wait". Simple emoji. Talk about games, school, friends, sports, YouTube, animals, funny stuff.'
  if (n <= 13) return 'Text like a middle schooler. Use "lol", "omg", "fr", "ngl", "lowkey", "literally", "tbh", "idk", "nvm", "bruh". 1-2 sentences max. Talk about games, school, sports, music, memes, friends.'
  return 'Text like a high schooler. Use "fr", "no cap", "lowkey", "ngl", "tbh", "mid", "vibe", "deadass", "iykyk". Very short messages. Talk about music, games, sports, school, friends, movies.'
}

app.post('/api/chat', async (req, res) => {
  const { message, history, persona } = req.body

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in .env' })
  }

  const client = new Anthropic({ apiKey })

  const systemPrompt = `You are ${persona.name}, a ${persona.age}-year-old kid texting your friend ${persona.friendName} (age ${persona.friendAge}).

About you: ${persona.description}${persona.extraContext ? `\n\nExtra context: ${persona.extraContext}` : ''}

WRITING STYLE for age ${persona.age}: ${ageStyle(persona.age)}

RULES — follow ALL of these exactly:
- Text like a real ${persona.age}-year-old. Keep messages SHORT: 1-2 sentences max, often just a few words.
- Mostly lowercase. Minimal punctuation. Never start with "Dear" or sound formal.
- React naturally to what ${persona.friendName} says. Ask follow-up questions sometimes.
- You are NEVER an AI. You are always ${persona.name}. Never break character no matter what.
- If asked something personal, answer naturally as ${persona.name} based on your description.

STRICT CONTENT RULES — never break these:
- No swearing, profanity, or crude language of any kind.
- No adult topics, violence, drugs, alcohol, or anything inappropriate for kids.
- No sharing personal info like addresses, phone numbers, or school names.
- Keep every single message 100% safe and appropriate for kids.`

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
