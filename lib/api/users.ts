import { apiRequest } from "./utils"
import type { User, RegisterUserData } from "@/types/user"
import type { ApiResponse, PaginatedResponse } from "@/types/api"

export const usersApi = {
  // Get all users with pagination
  getUsers: async (page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<User>>> => {
    try {
      const response = await apiRequest<PaginatedResponse<User>>(`/Users?page=${page}&limit=${limit}`, {
        method: "GET",
      })

      // Handle different response structures
      if (response.data) {
        return response
      } else if (Array.isArray(response)) {
        // If response is directly an array, wrap it in the expected structure
        return {
          data: {
            data: response as User[],
            meta: {
              currentPage: page,
              totalPages: 1,
              totalItems: (response as User[]).length,
              itemsPerPage: limit,
            },
          },
          status: 200,
        }
      } else {
        // If response has a different structure, try to extract the data
        const users = (response as any)?.users || (response as any)?.data || []
        return {
          data: {
            data: users,
            meta: {
              currentPage: page,
              totalPages: Math.ceil(users.length / limit),
              totalItems: users.length,
              itemsPerPage: limit,
            },
          },
          status: 200,
        }
      }
    } catch (error) {
      console.error("Error in getUsers:", error)
      return {
        error: error instanceof Error ? error.message : "Failed to fetch users",
        status: 500,
      }
    }
  },

  // Get user by ID
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    try {
      return await apiRequest<User>(`/Users/${id}`, {
        method: "GET",
      })
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to fetch user",
        status: 500,
      }
    }
  },

  // Create new user - using /Users/create endpoint
  createUser: async (userData: RegisterUserData): Promise<ApiResponse<User>> => {
    try {
      return await apiRequest<User>("/Users/create", {
        method: "POST",
        body: JSON.stringify(userData),
      })
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to create user",
        status: 500,
      }
    }
  },

  // Update user - using /Users/{id} endpoint
  updateUser: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      return await apiRequest<User>(`/Users/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      })
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to update user",
        status: 500,
      }
    }
  },

  // Delete user - using /Users/{id} endpoint
  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    try {
      return await apiRequest<void>(`/Users/${id}`, {
        method: "DELETE",
      })
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to delete user",
        status: 500,
      }
    }
  },

  // Get companies for dropdown
  getCompaniesForDropdown: async (): Promise<ApiResponse<{ id: number; name: string }[]>> => {
    try {
      const response = await apiRequest<any>("/Companies", {
        method: "GET",
      })

      if (response.data) {
        // Handle paginated response
        const companies = Array.isArray(response.data.data) ? response.data.data : response.data
        const transformedCompanies = companies.map((company: any) => ({
          id: company.id,
          name: company.name || company.companyName || `Company ${company.id}`,
        }))
        return {
          data: transformedCompanies,
          status: 200,
        }
      } else if (Array.isArray(response)) {
        // Handle direct array response
        const transformedCompanies = response.map((company: any) => ({
          id: company.id,
          name: company.name || company.companyName || `Company ${company.id}`,
        }))
        return {
          data: transformedCompanies,
          status: 200,
        }
      } else {
        return {
          data: [],
          status: 200,
        }
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error)
      return {
        error: error instanceof Error ? error.message : "Failed to fetch companies",
        status: 500,
      }
    }
  },

  // Get professionals for dropdown
  getProfessionalsForDropdown: async (): Promise<ApiResponse<{ id: number; name: string }[]>> => {
    try {
      const response = await apiRequest<any>("/Professional", {
        method: "GET",
      })

      if (response.data) {
        // Handle paginated response
        const professionals = Array.isArray(response.data.data) ? response.data.data : response.data
        const transformedProfessionals = professionals.map((professional: any) => ({
          id: professional.id,
          name: professional.name || professional.professionalName || `Professional ${professional.id}`,
        }))
        return {
          data: transformedProfessionals,
          status: 200,
        }
      } else if (Array.isArray(response)) {
        // Handle direct array response
        const transformedProfessionals = response.map((professional: any) => ({
          id: professional.id,
          name: professional.name || professional.professionalName || `Professional ${professional.id}`,
        }))
        return {
          data: transformedProfessionals,
          status: 200,
        }
      } else {
        return {
          data: [],
          status: 200,
        }
      }
    } catch (error) {
      console.error("Failed to fetch professionals:", error)
      return {
        error: error instanceof Error ? error.message : "Failed to fetch professionals",
        status: 500,
      }
    }
  },
}
