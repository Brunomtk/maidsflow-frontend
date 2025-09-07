"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, Upload, X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PhotoCaptureProps {
  onPhotoCapture: (photo: string) => void
  onPhotoRemove: () => void
  capturedPhoto?: string
  label: string
  required?: boolean
  className?: string
}

export function PhotoCapture({
  onPhotoCapture,
  onPhotoRemove,
  capturedPhoto,
  label,
  required = false,
  className,
}: PhotoCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      setIsCapturing(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setIsCapturing(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        const photoData = canvas.toDataURL("image/jpeg", 0.8)
        onPhotoCapture(photoData)
        stopCamera()
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onPhotoCapture(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const retakePhoto = () => {
    onPhotoRemove()
    startCamera()
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        {capturedPhoto && (
          <Button type="button" variant="outline" size="sm" onClick={retakePhoto} className="text-xs bg-transparent">
            <RotateCcw className="h-3 w-3 mr-1" />
            Retake
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {capturedPhoto ? (
            <div className="relative">
              <img
                src={capturedPhoto || "/placeholder.svg"}
                alt="Captured photo"
                className="w-full h-48 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={onPhotoRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : isCapturing ? (
            <div className="relative">
              <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover" />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <Button type="button" onClick={capturePhoto} className="rounded-full h-12 w-12">
                  <Camera className="h-6 w-6" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={stopCamera}
                  className="rounded-full h-12 w-12 bg-transparent"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center bg-muted/50 border-2 border-dashed border-muted-foreground/25">
              <div className="text-center space-y-4">
                <div className="flex justify-center gap-2">
                  <Button type="button" onClick={startCamera} className="flex-1 max-w-32">
                    <Camera className="h-4 w-4 mr-2" />
                    Camera
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 max-w-32"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Gallery
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Take a photo or select from gallery</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
