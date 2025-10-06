"use client"
import { useEffect } from "react"

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return

    const register = async () => {
      try {
        // Check if sw.js is accessible before registering
        const response = await fetch("/sw.js", { method: "HEAD" })
        if (!response.ok || !response.headers.get("content-type")?.includes("javascript")) {
          console.log("Service worker not available or invalid MIME type, skipping registration")
          return
        }

        await navigator.serviceWorker.register("/sw.js", { scope: "/" })
      } catch (err) {
        // Silently fail in preview environments where sw.js may not be available
        console.log("SW registration skipped:", err)
      }
    }

    const t = setTimeout(register, 500)
    return () => clearTimeout(t)
  }, [])

  return null
}
