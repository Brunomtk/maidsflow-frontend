"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    const path = window.location.pathname
    if (path !== "/") {
      router.push(path)
    }
  }, [router])

  return null
}
