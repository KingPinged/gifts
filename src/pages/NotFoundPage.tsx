import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="error-icon">🎁</div>
      <h1 className="error-title">Gift Not Found</h1>
      <p className="error-message">
        This gift link doesn't exist or may have expired.
        Please check the URL and try again.
      </p>
    </div>
  )
}
