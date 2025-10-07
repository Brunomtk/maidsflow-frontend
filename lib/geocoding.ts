"use client"

import { loadGoogleMapsApi } from "./google-maps"

export interface GeocodeResult {
  latitude: number
  longitude: number
  address: string
  accuracy: number
}

/**
 * Geocode an address to get latitude and longitude coordinates
 * @param address - The address to geocode
 * @returns Promise with latitude, longitude, formatted address, and accuracy
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  try {
    let google
    try {
      google = await loadGoogleMapsApi()
    } catch (apiError) {
      console.warn("Google Maps API not available, using fallback geocoding:", apiError)
      return geocodeAddressFallback(address)
    }

    const geocoder = new google.maps.Geocoder()

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location
          const formattedAddress = results[0].formatted_address

          // Determine accuracy based on location type
          let accuracy = 100 // Default accuracy in meters
          const locationType = results[0].geometry.location_type

          switch (locationType) {
            case google.maps.GeocoderLocationType.ROOFTOP:
              accuracy = 10 // Very accurate
              break
            case google.maps.GeocoderLocationType.RANGE_INTERPOLATED:
              accuracy = 50 // Good accuracy
              break
            case google.maps.GeocoderLocationType.GEOMETRIC_CENTER:
              accuracy = 100 // Moderate accuracy
              break
            case google.maps.GeocoderLocationType.APPROXIMATE:
              accuracy = 500 // Low accuracy
              break
          }

          resolve({
            latitude: location.lat(),
            longitude: location.lng(),
            address: formattedAddress,
            accuracy,
          })
        } else {
          console.warn(`Geocoding failed with status ${status}, using fallback`)
          resolve(geocodeAddressFallback(address))
        }
      })
    })
  } catch (error) {
    console.error("Error geocoding address, using fallback:", error)
    return geocodeAddressFallback(address)
  }
}

/**
 * Fallback geocoding using a simple approach (returns approximate coordinates)
 * This is used when Google Maps API is not available
 */
export function geocodeAddressFallback(address: string): GeocodeResult {
  // Return default coordinates (0, 0) with low accuracy
  // In production, you might want to use a different geocoding service
  console.warn("Using fallback geocoding - coordinates may not be accurate")
  return {
    latitude: 0,
    longitude: 0,
    address: address,
    accuracy: 0,
  }
}
