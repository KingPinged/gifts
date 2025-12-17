// Vercel Serverless Function: POST /api/gifts/:id/redeem

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  const data = getGiftsData()
  const gift = data.gifts.find(g => g.id === id)

  if (!gift) {
    return res.status(404).json({ error: 'Gift not found', code: 'NOT_FOUND' })
  }

  // Note: In serverless, we can't persist state changes without a database
  // The gift code is returned regardless, and redeemed state is tracked via GIFTS_DATA env var
  // For true persistence, you'd need to use a database (Vercel KV, Supabase, etc.)

  res.status(200).json({ code: gift.code })
}
