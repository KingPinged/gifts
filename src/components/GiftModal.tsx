import React, { useState, useEffect } from 'react'
import { useGiftStore, Gift } from '../store'
import axios from 'axios'

interface GiftModalProps {
  gift: Gift
}

export default function GiftModal({ gift }: GiftModalProps) {
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [redeemError, setRedeemError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [envelopeState, setEnvelopeState] = useState<'dropping' | 'opening' | 'opened'>('dropping')
  const { giftState, revealCode, setGiftState } = useGiftStore()

  useEffect(() => {
    // Animation sequence: drop in -> pause -> open envelope -> reveal letter
    const dropTimer = setTimeout(() => {
      setEnvelopeState('opening')
    }, 800)

    const openTimer = setTimeout(() => {
      setEnvelopeState('opened')
    }, 1600)

    return () => {
      clearTimeout(dropTimer)
      clearTimeout(openTimer)
    }
  }, [])

  const handleRedeem = async () => {
    if (gift.isRedeemed && gift.code) {
      setGiftState('revealed')
      return
    }

    setIsRedeeming(true)
    setRedeemError(null)

    try {
      const res = await axios.post(`/api/gifts/${gift.id}/redeem`)
      revealCode(res.data.code)
    } catch (err: any) {
      setRedeemError(err.response?.data?.error || 'Failed to redeem')
      setGiftState('opened')
    } finally {
      setIsRedeeming(false)
    }
  }

  const handleCopy = async () => {
    if (gift.code) {
      await navigator.clipboard.writeText(gift.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const showCode = giftState === 'revealed' || (gift.isRedeemed && gift.code)

  return (
    <>
      <div className="modal-backdrop" />
      <div className={`envelope-container ${envelopeState}`}>
        {/* Envelope */}
        <div className="envelope">
          {/* Envelope flap (triangle) */}
          <div className="envelope-flap">
            <div className="envelope-flap-inner" />
          </div>

          {/* Envelope body */}
          <div className="envelope-body">
            {/* Stamp */}
            <div className="stamp">
              <div className="stamp-inner">
                <span className="stamp-icon">&#10052;</span>
                <span className="stamp-text">SPECIAL<br/>DELIVERY</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Letter - outside envelope-container to fix position:fixed */}
      <div className={`letter ${envelopeState === 'opened' ? 'letter-visible' : ''}`}>
        <div className="letter-content">
          {/* Letter header with decorative line */}
          <div className="letter-header">
            <div className="letter-decoration">&#10053; &#10053; &#10053;</div>
          </div>

          {/* Greeting */}
          <h2 className="letter-greeting">
            {gift.recipientName ? `Dear ${gift.recipientName},` : 'Dear Friend,'}
          </h2>

          {/* Message */}
          <p className="letter-message">{gift.message}</p>

          {/* Signature area */}
          <div className="letter-signature">
            <span>Sincerely,</span>
            <span className="letter-heart">ML</span>
          </div>

          {/* Divider */}
          <div className="letter-divider" />

          {/* Action area */}
          {redeemError && (
            <div className="letter-error">
              {redeemError}
            </div>
          )}

          {showCode ? (
            <div className="code-section">
              <p className="code-label">Your gift code:</p>
              <div className="code-display">{gift.code}</div>
              <button
                className={`btn btn-copy ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          ) : (
            <button
              className="btn btn-redeem"
              onClick={handleRedeem}
              disabled={isRedeeming}
            >
              {isRedeeming ? (
                <span className="btn-loading">
                  <div className="spinner" /> Opening...
                </span>
              ) : (
                'Open Your Gift'
              )}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
