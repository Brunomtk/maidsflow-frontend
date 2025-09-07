import { fetchApi } from "./utils"

export type RecurrencePayload = {
  title: string
  customerId: number
  address: string
  teamId: number | null
  companyId: number
  frequency: number // 1=Weekly, 2=Monthly, 3=Bimonthly
  day: number       // weekly: 0-6 (Sun=0); monthly/bimonthly: 1-31
  time: { ticks: number }
  duration: number  // minutes
  status: number
  type: number
  startDate: string // ISO
  endDate: string   // ISO
  notes?: string
}

export const recurrenceApi = {
  async create(payload: RecurrencePayload) {
    return fetchApi("/Recurrence", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
}
