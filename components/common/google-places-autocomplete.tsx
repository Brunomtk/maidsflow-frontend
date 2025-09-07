"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { loadGoogleMapsApi } from "@/lib/google-maps"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Loader2, MapPin } from "lucide-react"

type Prediction = google.maps.places.AutocompletePrediction

export type PlacesSelection = {
  address: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  placeId?: string
}

type Props = {
  value: string
  onChange: (value: string) => void
  onSelect?: (value: PlacesSelection) => void
  placeholder?: string
  className?: string
  country?: string | string[] // e.g., "br" or ["br","us"]
  autoFocus?: boolean
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Digite o endereço...",
  className,
  country = "br",
  autoFocus = false,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [open, setOpen] = useState(false)
  const svcRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const detailsSvcRef = useRef<google.maps.places.PlacesService | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true
    loadGoogleMapsApi()
      .then((g) => {
        if (!mounted) return
        svcRef.current = new g.maps.places.AutocompleteService()
        // PlacesService precisa de um elemento DOM
        const div = document.createElement("div")
        detailsSvcRef.current = new g.maps.places.PlacesService(div)
        setReady(true)
      })
      .catch((err) => {
        console.error(err)
      })
    return () => {
      mounted = false
    }
  }, [])

  // Debounce simple
  const debounceRef = useRef<number | null>(null)
  const handleInput = (v: string) => {
    onChange(v)
    if (!ready || !svcRef.current) return
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    if (!v || v.length < 3) {
      setPredictions([])
      setOpen(false)
      return
    }
    debounceRef.current = window.setTimeout(() => {
      setLoading(true)
      const componentRestrictions = country
        ? { country: Array.isArray(country) ? country : [country] }
        : undefined
      svcRef.current!.getPlacePredictions(
        {
          input: v,
          types: ["address"],
          componentRestrictions,
        },
        (res) => {
          setLoading(false)
          setPredictions(res || [])
          setOpen((res?.length || 0) > 0)
        }
      )
    }, 200)
  }

  // Outside click to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSelect = (p: Prediction) => {
    const description = p.description
    onChange(description)
    setOpen(false)
    if (!detailsSvcRef.current || !onSelect) return
    detailsSvcRef.current.getDetails(
      { placeId: p.place_id, fields: ["formatted_address", "address_components"] },
      (place, status) => {
        if (!place || status !== google.maps.places.PlacesServiceStatus.OK) {
          onSelect({ address: description, placeId: p.place_id })
          return
        }
        const comps = place.address_components || []
        const get = (type: string) => comps.find((c) => c.types.includes(type))?.long_name
        const city = get("administrative_area_level_2") || get("locality") || get("sublocality") || undefined
        const state = get("administrative_area_level_1") || undefined
        const postal = get("postal_code") || undefined
        const country = get("country") || undefined
        onSelect({
          address: place.formatted_address || description,
          city,
          state,
          postalCode: postal,
          country,
          placeId: p.place_id,
        })
      }
    )
  }

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={placeholder}
          className="bg-[#0f172a] border-[#2a3349] text-white pr-10"
          autoFocus={autoFocus}
        />
        {loading ? <span className="-ml-8"><svg className="h-4 w-4 animate-spin text-gray-400" viewBox="0 0 24 24"></svg></span> : <MapPin className="h-4 w-4 text-gray-400 -ml-8" />}
      </div>

      {open && predictions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-[#2a3349] bg-[#0b1220] shadow-xl overflow-hidden">
          {predictions.map((p) => (
            <button
              key={p.place_id}
              type="button"
              onClick={() => handleSelect(p)}
              className="w-full text-left px-3 py-2 hover:bg-[#121a2c] text-gray-200"
            >
              {p.description}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
