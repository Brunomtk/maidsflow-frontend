"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback, useEffect } from "react"
import { toast } from "sonner"
import type { Customer, CustomerFilters } from "@/types/customer"
import { customersApi } from "@/lib/api/customers"

interface CustomersState {
  customers: Customer[]
  loading: boolean
  error: string | null
  filters: CustomerFilters
  selectedCustomer: Customer | null
}

type CustomersAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CUSTOMERS"; payload: Customer[] }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_FILTERS"; payload: CustomerFilters }
  | { type: "SET_SELECTED_CUSTOMER"; payload: Customer | null }
  | { type: "ADD_CUSTOMER"; payload: Customer }
  | { type: "UPDATE_CUSTOMER"; payload: Customer }
  | { type: "DELETE_CUSTOMER"; payload: number }

interface CustomersContextType {
  state: CustomersState
  fetchCustomers: () => Promise<void>
  createCustomer: (data: Omit<Customer, "id" | "createdDate" | "updatedDate">) => Promise<void>
  updateCustomer: (id: number, data: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: number) => Promise<void>
  setFilters: (filters: Partial<CustomerFilters>) => void
  setSelectedCustomer: (customer: Customer | null) => void
}

const CustomersContext = createContext<CustomersContextType | null>(null)

const initialState: CustomersState = {
  customers: [],
  loading: false,
  error: null,
  filters: {
    search: "",
    status: "all",
    companyId: undefined,
    pageNumber: 1,
    pageSize: 10,
  },
  selectedCustomer: null,
}

function customersReducer(state: CustomersState, action: CustomersAction): CustomersState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_CUSTOMERS":
      return { ...state, customers: action.payload, loading: false, error: null }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } }
    case "SET_SELECTED_CUSTOMER":
      return { ...state, selectedCustomer: action.payload }
    case "ADD_CUSTOMER":
      return { ...state, customers: [action.payload, ...state.customers] }
    case "UPDATE_CUSTOMER":
      return {
        ...state,
        customers: state.customers.map((customer) => (customer.id === action.payload.id ? action.payload : customer)),
      }
    case "DELETE_CUSTOMER":
      return {
        ...state,
        customers: state.customers.filter((customer) => customer.id !== action.payload),
      }
    default:
      return state
  }
}

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(customersReducer, initialState)

  const fetchCustomers = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      const filters = { ...state.filters }

      // Handle search filter - map to name if provided
      if (state.filters.search) {
        filters.name = state.filters.search
        delete filters.search
      }

      const response = await customersApi.getAll(filters)
      dispatch({ type: "SET_CUSTOMERS", payload: response.results || [] })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch customers"
      dispatch({ type: "SET_ERROR", payload: message })
      toast.error(message)
    }
  }, [state.filters])

  const createCustomerAction = useCallback(async (data: Omit<Customer, "id" | "createdDate" | "updatedDate">) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      const createData = {
        name: data.name,
        ssn: data.ssn,
        ticket: data.ticket,
        frequency: data.frequency,
        paymentMethod: data.paymentMethod,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        observations: data.observations,
        companyId: data.companyId,
      }

      const newCustomer = await customersApi.create(createData)
      dispatch({ type: "ADD_CUSTOMER", payload: newCustomer })
      toast.success("Customer created successfully")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create customer"
      dispatch({ type: "SET_ERROR", payload: message })
      toast.error(message)
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const updateCustomerAction = useCallback(
    async (id: number, data: Partial<Customer>) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })

        const existingCustomer = state.customers.find((c) => c.id === id)
        if (!existingCustomer) {
          throw new Error("Customer not found")
        }

        const updateData = {
          id: id,
          name: data.name || existingCustomer.name,
          ssn: data.ssn !== undefined ? data.ssn : existingCustomer.ssn,
          ticket: data.ticket !== undefined ? data.ticket : existingCustomer.ticket,
          frequency: data.frequency !== undefined ? data.frequency : existingCustomer.frequency,
          paymentMethod: data.paymentMethod !== undefined ? data.paymentMethod : existingCustomer.paymentMethod,
          email: data.email || existingCustomer.email,
          phone: data.phone || existingCustomer.phone,
          address: data.address || existingCustomer.address,
          city: data.city || existingCustomer.city,
          state: data.state || existingCustomer.state,
          observations: data.observations || existingCustomer.observations,
          status: data.status !== undefined ? data.status : existingCustomer.status,
          companyId: data.companyId || existingCustomer.companyId,
        }

        const updatedCustomer = await customersApi.update(updateData)
        dispatch({ type: "UPDATE_CUSTOMER", payload: updatedCustomer })
        toast.success("Customer updated successfully")
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update customer"
        dispatch({ type: "SET_ERROR", payload: message })
        toast.error(message)
        throw error
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    },
    [state.customers],
  )

  const deleteCustomerAction = useCallback(async (id: number) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      await customersApi.delete(id)
      dispatch({ type: "DELETE_CUSTOMER", payload: id })
      toast.success("Customer deleted successfully")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete customer"
      dispatch({ type: "SET_ERROR", payload: message })
      toast.error(message)
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const setFilters = useCallback((filters: Partial<CustomerFilters>) => {
    dispatch({ type: "SET_FILTERS", payload: filters })
  }, [])

  const setSelectedCustomer = useCallback((customer: Customer | null) => {
    dispatch({ type: "SET_SELECTED_CUSTOMER", payload: customer })
  }, [])

  // Fetch customers when filters change
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const value: CustomersContextType = {
    state,
    fetchCustomers,
    createCustomer: createCustomerAction,
    updateCustomer: updateCustomerAction,
    deleteCustomer: deleteCustomerAction,
    setFilters,
    setSelectedCustomer,
  }

  return <CustomersContext.Provider value={value}>{children}</CustomersContext.Provider>
}

export function useCustomers() {
  const context = useContext(CustomersContext)
  if (!context) {
    throw new Error("useCustomers must be used within a CustomersProvider")
  }
  return context
}
