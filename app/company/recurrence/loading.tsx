import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PageLoading } from "@/components/ui/page-loading"

export default function CompanyRecurrenceLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 bg-[#2a3349]" />
          <Skeleton className="h-4 w-64 bg-[#2a3349] mt-2" />
        </div>
        <Skeleton className="h-10 w-40 bg-[#2a3349]" />
      </div>

      {/* Filters */}
      <Card className="bg-[#1a2234] border-[#2a3349]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1 bg-[#2a3349]" />
            <Skeleton className="h-10 w-48 bg-[#2a3349]" />
            <Skeleton className="h-10 w-48 bg-[#2a3349]" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24 bg-[#2a3349]" />
              <Skeleton className="h-10 w-24 bg-[#2a3349]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-[#1a2234] border-[#2a3349]">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-[#2a3349]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-48 bg-[#2a3349]" />
                <Skeleton className="h-12 w-32 bg-[#2a3349]" />
                <Skeleton className="h-12 w-32 bg-[#2a3349]" />
                <Skeleton className="h-12 w-24 bg-[#2a3349]" />
                <Skeleton className="h-12 w-24 bg-[#2a3349]" />
                <Skeleton className="h-12 w-20 bg-[#2a3349]" />
                <Skeleton className="h-12 w-20 bg-[#2a3349]" />
                <Skeleton className="h-12 w-24 bg-[#2a3349]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Page Loading */}
      <PageLoading />
    </div>
  )
}
