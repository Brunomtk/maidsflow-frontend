import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, UserCheck, UserX, Shield } from "lucide-react"
import { PageLoading } from "@/components/ui/page-loading"

export default function UsersLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-gray-400">Manage system users and their permissions</p>
        </div>
        <Skeleton className="h-10 w-24 bg-[#2a3349]" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12 bg-[#2a3349]" />
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12 bg-[#2a3349]" />
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12 bg-[#2a3349]" />
          </CardContent>
        </Card>

        <Card className="bg-[#1a2234] border-[#2a3349]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-12 bg-[#2a3349]" />
          </CardContent>
        </Card>
      </div>

      {/* Users List Card */}
      <Card className="bg-[#1a2234] border-[#2a3349]">
        <CardHeader>
          <CardTitle className="text-white">Users List</CardTitle>
          <CardDescription className="text-gray-400">A list of all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex items-center space-x-2 mb-4">
            <Skeleton className="h-4 w-4 bg-[#2a3349]" />
            <Skeleton className="h-10 w-80 bg-[#2a3349]" />
          </div>

          {/* Table Header */}
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 pb-2 border-b border-[#2a3349]">
              <Skeleton className="h-4 w-16 bg-[#2a3349]" />
              <Skeleton className="h-4 w-12 bg-[#2a3349]" />
              <Skeleton className="h-4 w-14 bg-[#2a3349]" />
              <Skeleton className="h-4 w-16 bg-[#2a3349]" />
              <Skeleton className="h-4 w-16 bg-[#2a3349]" />
            </div>

            {/* Table Rows */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 items-center py-3">
                {/* User Column */}
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full bg-[#2a3349]" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-[#2a3349]" />
                    <Skeleton className="h-3 w-32 bg-[#2a3349]" />
                  </div>
                </div>

                {/* Role Column */}
                <div>
                  <Skeleton className="h-6 w-20 rounded-full bg-[#2a3349]" />
                </div>

                {/* Status Column */}
                <div>
                  <Skeleton className="h-6 w-16 rounded-full bg-[#2a3349]" />
                </div>

                {/* Created Column */}
                <div>
                  <Skeleton className="h-4 w-20 bg-[#2a3349]" />
                </div>

                {/* Actions Column */}
                <div>
                  <Skeleton className="h-8 w-8 bg-[#2a3349]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function Loading() {
  return <PageLoading />
}
