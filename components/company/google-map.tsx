"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, MapPin } from "lucide-react"

interface MapMarker {
  id: string | number
  position: {
    lat: number
    lng: number
  }
  title: string
  address?: string
  status?: string
}

interface GoogleMapProps {
  markers: MapMarker[]
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
  onMarkerClick?: (marker: MapMarker) => void
}

export function GoogleMap({ markers, center, zoom = 12, className = "", onMarkerClick }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    let map: any = null
    const markerInstances: any[] = []

    const initMap = async () => {
      if (!mapRef.current) return

      try {
        setIsLoading(true)
        setError(null)

        // Check if Google Maps is already loaded
        if (!(window as any).google || !(window as any).google.maps) {
          // Load Google Maps script
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          if (!apiKey) {
            throw new Error("Google Maps API key not configured")
          }

          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script")
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`
            script.async = true
            script.defer = true
            script.onload = () => resolve()
            script.onerror = () => reject(new Error("Failed to load Google Maps"))
            document.head.appendChild(script)
          })
        }

        if (!mounted) return

        const google = (window as any).google

        // Determine map center
        let mapCenter = center
        if (!mapCenter && markers.length > 0) {
          const validMarker = markers.find((m) => m.position.lat !== 0 || m.position.lng !== 0)
          if (validMarker) {
            mapCenter = validMarker.position
          }
        }
        if (!mapCenter) {
          mapCenter = { lat: -23.5505, lng: -46.6333 } // Default: São Paulo
        }

        // Create map with dark theme
        map = new google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: zoom,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#1a2234" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#1a2234" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#8b92a8" }] },
            {
              featureType: "administrative.locality",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "poi",
              elementType: "labels.text.fill",
              stylers: [{ color: "#8b92a8" }],
            },
            {
              featureType: "poi.park",
              elementType: "geometry",
              stylers: [{ color: "#263c3f" }],
            },
            {
              featureType: "poi.park",
              elementType: "labels.text.fill",
              stylers: [{ color: "#6b9a76" }],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#2a3349" }],
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#212a37" }],
            },
            {
              featureType: "road",
              elementType: "labels.text.fill",
              stylers: [{ color: "#9ca5b3" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry",
              stylers: [{ color: "#2a3349" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry.stroke",
              stylers: [{ color: "#1f2835" }],
            },
            {
              featureType: "road.highway",
              elementType: "labels.text.fill",
              stylers: [{ color: "#f3d19c" }],
            },
            {
              featureType: "transit",
              elementType: "geometry",
              stylers: [{ color: "#2f3948" }],
            },
            {
              featureType: "transit.station",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#17263c" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.fill",
              stylers: [{ color: "#515c6d" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#17263c" }],
            },
          ],
        })

        setMapInstance(map)

        // Add markers
        const bounds = new google.maps.LatLngBounds()
        let hasValidMarkers = false

        markers.forEach((markerData) => {
          const position = markerData.position

          // Skip invalid coordinates
          if (position.lat === 0 && position.lng === 0) {
            console.warn(`Skipping marker ${markerData.id} with invalid coordinates`)
            return
          }

          const marker = new google.maps.Marker({
            position: position,
            map: map,
            title: markerData.title,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: markerData.status === "active" ? "#06b6d4" : "#ef4444",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          })

          // Create info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="color: #000; padding: 8px; min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">${markerData.title}</h3>
                ${markerData.address ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${markerData.address}</p>` : ""}
                ${markerData.status ? `<p style="margin: 0; font-size: 12px;"><strong>Status:</strong> ${markerData.status}</p>` : ""}
              </div>
            `,
          })

          marker.addListener("click", () => {
            infoWindow.open(map, marker)
            if (onMarkerClick) {
              onMarkerClick(markerData)
            }
          })

          markerInstances.push(marker)
          bounds.extend(position)
          hasValidMarkers = true
        })

        // Fit map to bounds if we have multiple valid markers
        if (hasValidMarkers && markers.length > 1) {
          map.fitBounds(bounds)
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error initializing map:", err)
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load map")
          setIsLoading(false)
        }
      }
    }

    initMap()

    return () => {
      mounted = false
      // Clean up markers
      markerInstances.forEach((marker) => marker.setMap(null))
    }
  }, [markers, center, zoom, onMarkerClick])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 font-medium mb-2">Map Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">Please check your Google Maps API key configuration</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <div className="text-center p-8">
          <Loader2 className="h-12 w-12 text-[#06b6d4] animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className={`rounded-lg ${className}`} style={{ minHeight: "400px" }} />
}
