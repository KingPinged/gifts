import { create } from 'zustand'

export interface Gift {
  id: string
  recipientName: string
  message: string
  isRedeemed: boolean
  code?: string
}

export type GiftState = 'loading' | 'idle' | 'hovering' | 'opening' | 'opened' | 'revealed' | 'error'

interface GiftStore {
  gift: Gift | null
  giftState: GiftState
  error: string | null
  isMuted: boolean
  setGift: (gift: Gift) => void
  setGiftState: (state: GiftState) => void
  setError: (error: string | null) => void
  setMuted: (muted: boolean) => void
  openGift: () => void
  revealCode: (code: string) => void
}

export const useGiftStore = create<GiftStore>((set, get) => ({
  gift: null,
  giftState: 'loading',
  error: null,
  isMuted: true,

  setGift: (gift) => set({ gift, giftState: 'idle', error: null }),
  setGiftState: (giftState) => set({ giftState }),
  setError: (error) => set({ error, giftState: 'error' }),
  setMuted: (isMuted) => set({ isMuted }),

  openGift: () => {
    const { giftState } = get()
    if (giftState === 'idle' || giftState === 'hovering') {
      set({ giftState: 'opening' })
      setTimeout(() => set({ giftState: 'opened' }), 2000)
    }
  },

  revealCode: (code) => {
    const { gift } = get()
    if (gift) {
      set({ gift: { ...gift, code, isRedeemed: true }, giftState: 'revealed' })
    }
  },
}))
