"use client"

import { NoahLogo } from "@/components/noah-logo"

export function PageLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="relative flex flex-col items-center justify-center space-y-6">
        {/* Anéis rotativos */}
        <div className="relative">
          {/* Anel externo */}
          <div className="h-20 w-20 animate-spin rounded-full border-3 border-transparent border-t-[#06b6d4] opacity-80" />

          {/* Anel interno */}
          <div
            className="absolute inset-2 h-16 w-16 animate-spin rounded-full border-3 border-transparent border-b-[#0ea5e9]"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          />

          {/* Logo centralizada */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse">
              <NoahLogo className="h-10 w-10" />
            </div>
          </div>
        </div>

        {/* Texto */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-muted-foreground">Carregando</span>
          <div className="flex space-x-1">
            <div className="h-1 w-1 animate-bounce rounded-full bg-[#06b6d4]" style={{ animationDelay: "0ms" }} />
            <div className="h-1 w-1 animate-bounce rounded-full bg-[#06b6d4]" style={{ animationDelay: "150ms" }} />
            <div className="h-1 w-1 animate-bounce rounded-full bg-[#06b6d4]" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
