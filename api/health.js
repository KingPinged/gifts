// Vercel Serverless Function: GET /api/health

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const giftsDataExists = !!process.env.GIFTS_DATA
  let giftsCount = 0
  let parseError = null

  if (giftsDataExists) {
    try {
      const data = JSON.parse(process.env.GIFTS_DATA)
      giftsCount = data.gifts?.length || 0
    } catch (e) {
      parseError = e.message
    }
  }

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'vercel',
    giftsDataExists,
    giftsCount,
    parseError,
    envVarLength: process.env.GIFTS_DATA?.length || 0
  })
}
