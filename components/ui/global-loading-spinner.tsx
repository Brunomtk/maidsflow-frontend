"use client"

import { NoahLogo } from "@/components/noah-logo"

export function GlobalLoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      {/* Partículas de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          >
            <div className="h-1 w-1 rounded-full bg-[#06b6d4] opacity-30" />
          </div>
        ))}
      </div>

      {/* Container principal */}
      <div className="relative flex flex-col items-center justify-center space-y-12">
        {/* Logo em destaque com efeitos */}
        <div className="relative">
          {/* Glow effect atrás da logo */}
          <div className="absolute inset-0 animate-pulse">
            <div className="h-32 w-32 rounded-full bg-[#06b6d4] opacity-20 blur-xl" />
          </div>

          {/* Anéis rotativos maiores */}
          <div className="relative">
            {/* Anel externo grande */}
            <div className="h-40 w-40 animate-spin rounded-full border-4 border-transparent border-t-[#06b6d4] border-r-[#06b6d4] opacity-60" />

            {/* Anel médio */}
            <div
              className="absolute inset-3 h-34 w-34 animate-spin rounded-full border-3 border-transparent border-b-[#0ea5e9] border-l-[#0ea5e9] opacity-50"
              style={{ animationDirection: "reverse", animationDuration: "2s" }}
            />

            {/* Anel interno */}
            <div
              className="absolute inset-6 h-28 w-28 animate-spin rounded-full border-2 border-transparent border-t-[#38bdf8] border-r-[#38bdf8] opacity-40"
              style={{ animationDuration: "3s" }}
            />

            {/* Logo centralizada e maior */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Shadow/glow da logo */}
                <div className="absolute inset-0 animate-pulse">
                  <NoahLogo className="h-20 w-20 opacity-30 blur-sm" />
                </div>
                {/* Logo principal */}
                <div className="relative animate-pulse">
                  <NoahLogo className="h-20 w-20 drop-shadow-2xl filter" />
                </div>
              </div>
            </div>
          </div>

          {/* Pontos orbitais */}
          <div className="absolute inset-0">
            <div
              className="absolute h-3 w-3 rounded-full bg-[#06b6d4] animate-spin opacity-80"
              style={{
                top: "10%",
                left: "50%",
                transformOrigin: "0 70px",
                animationDuration: "4s",
              }}
            />
            <div
              className="absolute h-2 w-2 rounded-full bg-[#0ea5e9] animate-spin opacity-60"
              style={{
                top: "50%",
                right: "10%",
                transformOrigin: "-70px 0",
                animationDuration: "6s",
                animationDirection: "reverse",
              }}
            />
            <div
              className="absolute h-2 w-2 rounded-full bg-[#38bdf8] animate-spin opacity-70"
              style={{
                bottom: "10%",
                left: "50%",
                transformOrigin: "0 -70px",
                animationDuration: "5s",
              }}
            />
          </div>
        </div>

        {/* Texto animado melhorado */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-white tracking-wide">Loading</span>
            <div className="flex space-x-2">
              <div className="h-3 w-3 animate-bounce rounded-full bg-[#06b6d4]" style={{ animationDelay: "0ms" }} />
              <div className="h-3 w-3 animate-bounce rounded-full bg-[#0ea5e9]" style={{ animationDelay: "200ms" }} />
              <div className="h-3 w-3 animate-bounce rounded-full bg-[#38bdf8]" style={{ animationDelay: "400ms" }} />
            </div>
          </div>

          {/* Subtítulo */}
          <p className="text-sm text-gray-400 animate-pulse">Professional Cleaning Platform</p>
        </div>

        {/* Barra de progresso melhorada */}
        <div className="w-80 h-2 bg-gray-800 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#06b6d4] via-[#0ea5e9] to-[#38bdf8] rounded-full shadow-lg"
            style={{
              animation: "progress 3s ease-in-out infinite",
            }}
          />
        </div>

        {/* Elementos flutuantes melhorados */}
        <div className="absolute -top-20 -left-20 h-6 w-6 animate-ping rounded-full bg-[#06b6d4] opacity-20" />
        <div
          className="absolute -bottom-20 -right-20 h-8 w-8 animate-ping rounded-full bg-[#0ea5e9] opacity-15"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-20 -right-32 h-4 w-4 animate-ping rounded-full bg-[#38bdf8] opacity-25"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute -top-32 right-20 h-5 w-5 animate-ping rounded-full bg-[#06b6d4] opacity-20"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { 
            transform: translateX(-100%); 
            opacity: 0.5;
          }
          50% { 
            transform: translateX(0%); 
            opacity: 1;
          }
          100% { 
            transform: translateX(100%); 
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}
