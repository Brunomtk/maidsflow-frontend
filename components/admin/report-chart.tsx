"use client"

import { useEffect, useState } from "react"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ReportChartProps {
  type: "bar" | "line" | "pie" | "bar-horizontal" | "bar-stacked"
  data?: any[]
}

export function ReportChart({ type, data: propData }: ReportChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If data is provided as prop, use it
    if (propData) {
      setData(propData)
      setLoading(false)
      return
    }

    // Otherwise generate mock data based on chart type
    setLoading(true)

    let mockData: any[] = []

    if (type === "pie") {
      mockData = [
        { name: "Limpeza Residencial", value: 35, color: "#06b6d4" },
        { name: "Limpeza Comercial", value: 25, color: "#0ea5e9" },
        { name: "Limpeza Pós-obra", value: 15, color: "#3b82f6" },
        { name: "Limpeza de Vidros", value: 10, color: "#6366f1" },
        { name: "Outros Serviços", value: 15, color: "#8b5cf6" },
      ]
    } else if (type === "line") {
      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
      mockData = months.map((month, index) => ({
        name: month,
        valor: 3000 + Math.floor(Math.random() * 5000),
        previsão: 3500 + Math.floor(Math.random() * 4000),
      }))
    } else if (type === "bar") {
      const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
      mockData = days.map((day) => ({
        name: day,
        agendamentos: 10 + Math.floor(Math.random() * 40),
      }))
    } else if (type === "bar-horizontal") {
      mockData = [
        { name: "Limpeza Residencial", tempo: 120 },
        { name: "Limpeza Comercial", tempo: 180 },
        { name: "Limpeza Pós-obra", tempo: 240 },
        { name: "Limpeza de Vidros", tempo: 90 },
        { name: "Outros Serviços", tempo: 60 },
      ]
    } else if (type === "bar-stacked") {
      mockData = [
        { name: "18-24", masculino: 20, feminino: 30, outro: 5 },
        { name: "25-34", masculino: 35, feminino: 45, outro: 8 },
        { name: "35-44", masculino: 40, feminino: 35, outro: 6 },
        { name: "45-54", masculino: 25, feminino: 20, outro: 4 },
        { name: "55+", masculino: 15, feminino: 18, outro: 3 },
      ]
    }

    setData(mockData)
    setLoading(false)
  }, [type, propData])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>
  }

  const COLORS = ["#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6"]

  if (type === "pie") {
    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "line") {
    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="valor" stroke="#06b6d4" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="previsão" stroke="#8b5cf6" strokeDasharray="5 5" />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "bar") {
    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="agendamentos" fill="#06b6d4" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "bar-horizontal") {
    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            layout="vertical"
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 100,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" />
            <Tooltip />
            <Legend />
            <Bar dataKey="tempo" fill="#06b6d4" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "bar-stacked") {
    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="masculino" stackId="a" fill="#06b6d4" />
            <Bar dataKey="feminino" stackId="a" fill="#8b5cf6" />
            <Bar dataKey="outro" stackId="a" fill="#10b981" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return null
}
