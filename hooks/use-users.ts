"use client"

import { useState } from "react"
import type { User } from "@/types"
import { usersApi } from "@/lib/api"

interface UseUsersReturn {
  users: User[]
  isLoading: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  fetchUsers: (page?: number, limit?: number) => Promise<void>
  getUserById: (id: string) => Promise<User | null>
  updateUser: (id: string, userData: Partial<User>) => Promise<User | null>
  deleteUser: (id: string) => Promise<boolean>
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })

  // Buscar usuários com paginação
  const fetchUsers = async (page = 1, limit = 10): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await usersApi.getUsers(page, limit)

      if (response.data) {
        setUsers(response.data.data)
        setPagination(response.data.meta)
      } else {
        setError(response.error || "Failed to fetch users")
      }
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar usuário por ID
  const getUserById = async (id: string): Promise<User | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await usersApi.getUserById(id)

      if (response.data) {
        return response.data
      } else {
        setError(response.error || "User not found")
        return null
      }
    } catch (err) {
      console.error("Error fetching user:", err)
      setError("An unexpected error occurred")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Atualizar usuário
  const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await usersApi.updateUser(id, userData)

      if (response.data) {
        // Atualizar a lista de usuários se o usuário estiver nela
        setUsers((prevUsers) => prevUsers.map((user) => (user.id === id ? response.data! : user)))
        return response.data
      } else {
        setError(response.error || "Failed to update user")
        return null
      }
    } catch (err) {
      console.error("Error updating user:", err)
      setError("An unexpected error occurred")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Excluir usuário
  const deleteUser = async (id: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await usersApi.deleteUser(id)

      if (response.status === 204) {
        // Remover o usuário da lista
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id))
        return true
      } else {
        setError(response.error || "Failed to delete user")
        return false
      }
    } catch (err) {
      console.error("Error deleting user:", err)
      setError("An unexpected error occurred")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    users,
    isLoading,
    error,
    pagination,
    fetchUsers,
    getUserById,
    updateUser,
    deleteUser,
  }
}
