const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 5001

// Data storage mode: 'env' for production (Railway), 'file' for local dev
const USE_ENV = !!process.env.GIFTS_DATA
const DATA_PATH = path.join(__dirname, 'gifts.json')

// In-memory store for env mode (persists redeemed state during server lifetime)
let inMemoryGifts = null

// Initialize gifts data
function initGifts() {
  if (USE_ENV) {
    // Production: Load from environment variable
    try {
      inMemoryGifts = JSON.parse(process.env.GIFTS_DATA)
      console.log(`Loaded ${inMemoryGifts.gifts.length} gifts from environment`)
    } catch (e) {
      console.error('Failed to parse GIFTS_DATA env var:', e.message)
      inMemoryGifts = { gifts: [] }
    }
  } else {
    // Local dev: Use file, create if doesn't exist
    if (!fs.existsSync(DATA_PATH)) {
      fs.writeFileSync(DATA_PATH, JSON.stringify({
        gifts: [
          {
            id: 'demo-gift-2025',
            recipientName: 'Friend',
            message: 'Happy Holidays! Here\'s a special gift just for you!',
            code: 'DEMO-CODE-XXXX-YYYY',
            redeemed: false,
            createdAt: new Date().toISOString()
          }
        ]
      }, null, 2))
    }
    console.log('Using local gifts.json file')
  }
}

initGifts()

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}))
app.use(express.json())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests', code: 'RATE_LIMIT' }
})
app.use(limiter)

// Helper functions
function readGifts() {
  if (USE_ENV) {
    return inMemoryGifts
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'))
}

function writeGifts(data) {
  if (USE_ENV) {
    // In env mode, just update in-memory (redeemed state persists until restart)
    inMemoryGifts = data
  } else {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Get gift by ID
app.get('/api/gifts/:id', (req, res) => {
  const { id } = req.params
  const data = readGifts()
  const gift = data.gifts.find(g => g.id === id)

  if (!gift) {
    return res.status(404).json({ error: 'Gift not found', code: 'NOT_FOUND' })
  }

  res.json({
    id: gift.id,
    recipientName: gift.recipientName,
    message: gift.message,
    isRedeemed: gift.redeemed,
    code: gift.redeemed ? gift.code : undefined
  })
})

// Redeem gift
app.post('/api/gifts/:id/redeem', (req, res) => {
  const { id } = req.params
  const data = readGifts()
  const gift = data.gifts.find(g => g.id === id)

  if (!gift) {
    return res.status(404).json({ error: 'Gift not found', code: 'NOT_FOUND' })
  }

  if (gift.redeemed) {
    return res.json({ code: gift.code })
  }

  gift.redeemed = true
  gift.redeemedAt = new Date().toISOString()
  writeGifts(data)

  res.json({ code: gift.code })
})

// Start server
app.listen(PORT, () => {
  console.log(`🎁 Gift server running on http://localhost:${PORT}`)
})
