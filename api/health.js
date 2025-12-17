// Vercel Serverless Function: GET /api/health

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'vercel'
  })
}
