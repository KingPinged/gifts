// Vercel Serverless Function: Catch-all for /api/gifts/*

function getGiftsData() {
  if (!process.env.GIFTS_DATA) {
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Parse params from Vercel's catch-all route: [[...params]]
  // req.query.params is an array like ['gift-id'] or ['gift-id', 'redeem']
  const params = req.query.params || []

  const id = params[0]
  const action = params[1] // 'redeem' or undefined

  if (!id) {
    return res.status(400).json({
      error: 'Gift ID required',
      debug: { params, url: req.url }
    })
  }

  const data = getGiftsData()
  const gift = data.gifts.find(g => g.id === id)

  if (!gift) {
    return res.status(404).json({
      error: 'Gift not found',
      code: 'NOT_FOUND',
      searchedId: id,
      availableIds: data.gifts.map(g => g.id)
    })
  }

  // POST /api/gifts/:id/redeem
  if (action === 'redeem' && req.method === 'POST') {
    return res.status(200).json({ code: gift.code })
  }

  // GET /api/gifts/:id
  if (req.method === 'GET' && !action) {
    return res.status(200).json({
      id: gift.id,
      recipientName: gift.recipientName,
      message: gift.message,
      isRedeemed: gift.redeemed,
      code: gift.redeemed ? gift.code : undefined
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
