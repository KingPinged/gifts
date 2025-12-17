import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { useGiftStore } from '../store'
import Scene from '../components/Scene'
import GiftModal from '../components/GiftModal'
import axios from 'axios'

export default function GiftPage() {
  const { id } = useParams<{ id: string }>()
  const { gift, giftState, error, isMuted, setGift, setError, setMuted, openGift } = useGiftStore()
  const [audioStarted, setAudioStarted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!id) {
      setError('No gift ID provided')
      return
    }

    async function loadGift() {
      try {
        const res = await axios.get(`/api/gifts/${id}`)
        setGift(res.data)
      } catch (err: any) {
        setError(err.response?.data?.error || 'Gift not found')
      }
    }

    loadGift()
  }, [id, setGift, setError])

  // Handle mute/unmute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted])

  const handleInteraction = () => {
    if (!audioStarted && audioRef.current) {
      audioRef.current.volume = 0.3 // Lower volume
      audioRef.current.play().catch(() => {})
      setAudioStarted(true)
      setMuted(false)
    }
  }

  if (giftState === 'loading') {
    return (
      <div className="loading-screen">
        <div className="loading-icon">🎁</div>
        <p className="loading-text">Preparing your gift...</p>
        <div className="loading-dots">
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
      </div>
    )
  }

  if (giftState === 'error' || error) {
    return (
      <div className="error-screen">
        <div className="error-icon">😔</div>
        <h1 className="error-title">Oops!</h1>
        <p className="error-message">{error || 'Something went wrong'}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    )
  }

  const showModal = giftState === 'opened' || giftState === 'revealed'

  return (
    <div className="gift-page" onClick={handleInteraction}>
      <audio ref={audioRef} src="/music/music.mp3" loop preload="auto" />

      <Canvas
        camera={{ position: [5, 0, 8], fov: 80 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene onGiftClick={openGift} />
      </Canvas>

      <button className="audio-control" onClick={() => setMuted(!isMuted)}>
        {isMuted ? '🔇' : '🔊'}
      </button>

      {showModal && gift && <GiftModal gift={gift} />}

      {giftState === 'idle' && (
        <div className="click-hint">Click the gift to open it</div>
      )}
    </div>
  )
}
