'use client'
import { useEffect } from 'react'

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      } catch (err) {
        console.error('SW registration failed', err)
      }
    }

    const t = setTimeout(register, 500)
    return () => clearTimeout(t)
  }, [])

  return null
}
