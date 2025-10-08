"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 300) // Wait for fade out animation
    }, 2000) // Show splash for 2 seconds

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
        {/* Logo with glow effect */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 blur-3xl opacity-50">
            <div className="w-32 h-32 bg-cyan-500 rounded-full" />
          </div>

          <div className="relative bg-gradient-to-br from-cyan-400 to-cyan-600 p-8 rounded-3xl shadow-2xl">
            <Image src="/logo.png" alt="Maids Flow Logo" width={96} height={96} className="w-24 h-24" priority />
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">Maids Flow</h1>
          <p className="text-cyan-400 text-sm font-medium tracking-wider">PROFESSIONAL CLEANING MANAGEMENT</p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2 mt-4">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  )
}
