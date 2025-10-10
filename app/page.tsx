"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LandingPage from "./landing/page"
import SplashScreen from "@/components/splash-screen"

export default function Home() {
  const router = useRouter()
  const [isPWA, setIsPWA] = useState<boolean | null>(null)

  useEffect(() => {
    const checkPWAMode = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      const isIOSStandalone = (window.navigator as any).standalone === true
      return isStandalone || isIOSStandalone
    }

    const pwaMode = checkPWAMode()
    setIsPWA(pwaMode)
  }, [])

  const handleSplashComplete = () => {
    router.push("/login")
  }

  if (isPWA === true) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  if (isPWA === false) {
    return <LandingPage />
  }

  return <SplashScreen onComplete={handleSplashComplete} />
}
