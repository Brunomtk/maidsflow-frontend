export interface GPSLocation {
  latitude: number
  longitude: number
  address: string
  accuracy: number
}

export interface GPSTracking {
  id: number
  professionalId: number
  professionalName: string
  companyId: number
  companyName: string
  vehicle: string
  location: GPSLocation
  speed: number
  status: number // 1 = active, 2 = inactive
  battery: number
  notes: string
  timestamp: string
  createdDate: string
  updatedDate: string
}

export interface GPSTrackingCreateRequest {
  professionalId: number
  professionalName: string
  companyId: number
  companyName: string
  vehicle: string
  latitude: number
  longitude: number
  address: string
  accuracy: number
  speed: number
  status: number
  battery: number
  notes: string
  timestamp: string
}

export interface GPSTrackingUpdateRequest {
  professionalId: number
  professionalName: string
  companyId: number
  companyName: string
  vehicle: string
  latitude: number
  longitude: number
  address: string
  accuracy: number
  speed: number
  status: number
  battery: number
  notes: string
  timestamp: string
}

export interface GPSTrackingPagedResponse {
  data: GPSTracking[]
  meta: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export interface GPSTrackingFilters {
  status?: number | "all"
  professionalId?: number
  companyId?: string
  searchQuery?: string
  dateFrom?: string
  dateTo?: string
  pageNumber?: number
  pageSize?: number
}

export interface CompanyGPSTrackingFilters extends Omit<GPSTrackingFilters, "companyId"> {
  teamId?: string
}
