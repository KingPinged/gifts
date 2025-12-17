// Vercel Serverless Function: GET /api/gifts/:id

function getGiftsData() {
  if (!process.env.GIFTS_DATA) {
    // Return demo data if env var not set
    return {
      gifts: [
        {
          id: 'demo-gift-2025',
          recipientName: 'Friend',
          message: "Happy Holidays! Here's a special gift just for you!",
          code: 'DEMO-CODE-XXXX-YYYY',
          redeemed: false,
          createdAt: new Date().toISOString()
        }
      ]
    }
  }

  try {
    return JSON.parse(process.env.GIFTS_DATA)
  } catch (e) {
    console.error('Failed to parse GIFTS_DATA:', e.message)
    return { gifts: [] }
  }
}

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  const data = getGiftsData()
  const gift = data.gifts.find(g => g.id === id)

  if (!gift) {
    return res.status(404).json({ error: 'Gift not found', code: 'NOT_FOUND' })
  }

  res.status(200).json({
    id: gift.id,
    recipientName: gift.recipientName,
    message: gift.message,
    isRedeemed: gift.redeemed,
    code: gift.redeemed ? gift.code : undefined
  })
}
