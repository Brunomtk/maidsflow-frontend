import { fetchApi } from "./utils"
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerFilters,
  CustomerResponse,
} from "@/types/customer"

export const customersApi = {
  async getAll(filters?: CustomerFilters): Promise<CustomerResponse> {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append("CompanyId", filters.companyId.toString());
    if (filters?.name) params.append("Name", filters.name);
    if (filters?.ssn) params.append("Ssn", filters.ssn);
    if (filters?.status !== undefined && filters.status !== "all") {
      params.append("Status", filters.status.toString())
    }
    if (filters?.pageNumber) params.append("PageNumber", filters.pageNumber.toString());
    if (filters?.pageSize) params.append("PageSize", filters.pageSize.toString())

    const queryString = params.toString()
    const url = queryString ? `/Customer?${queryString}` : "/Customer"

    return await fetchApi(url)
  },

  async getById(id: number): Promise<Customer> {
    return await fetchApi(`/Customer/${id}`)
  },

  async create(data: CreateCustomerRequest): Promise<Customer> {
    return await fetchApi("/Customer", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async update(data: UpdateCustomerRequest): Promise<Customer> {
    return await fetchApi("/Customer", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  async delete(id: number): Promise<void> {
    return await fetchApi(`/Customer/${id}`, {
      method: "DELETE",
    })
  },
}
