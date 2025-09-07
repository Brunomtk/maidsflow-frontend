"use client"

let gmapsPromise: Promise<typeof google> | null = null

export function loadGoogleMapsApi(apiKey?: string, language = "pt-BR", region = "BR", libraries: string[] = ["places"]) {
  if (typeof window === "undefined") return Promise.reject(new Error("window not available"))
  if ((window as any).google && (window as any).google.maps) return Promise.resolve((window as any).google)

  if (!gmapsPromise) {
    const keyFromEnv = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    const keyFromLs = typeof window !== "undefined" ? (localStorage.getItem("gmaps_api_key") ?? undefined) : undefined
    const key = apiKey || keyFromLs || keyFromEnv
    if (!key) {
      return Promise.reject(new Error("Google Maps API key not configured. Defina NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ou localStorage.gmaps_api_key."))
    }

    gmapsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script")
      const params = new URLSearchParams({
        key,
        language,
        region,
        libraries: libraries.join(","),
        v: "weekly"
      })
      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`
      script.async = true
      script.defer = true
      script.onload = () => resolve((window as any).google)
      script.onerror = () => reject(new Error("Failed to load Google Maps script"))
      document.head.appendChild(script)
    })
  }
  return gmapsPromise!
}
