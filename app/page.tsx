"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LandingPage from "./landing/page"
import SplashScreen from "@/components/splash-screen"

export default function Home() {
  const router = useRouter()
  const [showSplash, setShowSplash] = useState(false)
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    const checkPWAMode = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      const isIOSStandalone = (window.navigator as any).standalone === true
      return isStandalone || isIOSStandalone
    }

    const pwaMode = checkPWAMode()
    setIsPWA(pwaMode)

    if (pwaMode) {
      setShowSplash(true)
    }
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
    router.push("/login")
  }

  if (isPWA && showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  if (!isPWA) {
    return <LandingPage />
  }

  return null
}
