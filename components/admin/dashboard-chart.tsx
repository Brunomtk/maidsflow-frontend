"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export function DashboardChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destruir gráfico anterior se existir
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Dados de exemplo
    const labels = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
    const data = [18, 25, 32, 28, 22, 15, 8]

    // Criar novo gráfico
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Agendamentos",
            data,
            backgroundColor: "#06b6d4",
            borderRadius: 4,
            barThickness: 12,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#1a2234",
            titleColor: "#fff",
            bodyColor: "#94a3b8",
            borderColor: "#2a3349",
            borderWidth: 1,
            padding: 10,
            displayColors: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: "#94a3b8",
              font: {
                size: 10,
              },
            },
          },
          y: {
            grid: {
              color: "#2a3349",
              drawBorder: false,
            },
            ticks: {
              color: "#94a3b8",
              font: {
                size: 10,
              },
              stepSize: 10,
            },
          },
        },
      },
    })

    // Limpar ao desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  return (
    <div className="h-[240px]">
      <canvas ref={chartRef} />
    </div>
  )
}
