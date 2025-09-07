"use client"

import type React from "react"

import { AdminSidebar, SidebarProvider } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { CompaniesProvider } from "@/contexts/companies-context"
import { PlansProvider } from "@/contexts/plans-context"
import { TeamsProvider } from "@/contexts/teams-context"
import { ProfessionalsProvider } from "@/contexts/professionals-context"
import { CustomersProvider } from "@/contexts/customers-context"
import { UsersProvider } from "@/contexts/users-context"
import { AppointmentsProvider } from "@/contexts/appointments-context"
import { CancellationsProvider } from "@/contexts/cancellations-context"
import { CheckRecordsProvider } from "@/contexts/check-records-context"
import { GpsTrackingProvider } from "@/contexts/gps-tracking-context"
import { InternalFeedbackProvider } from "@/contexts/internal-feedback-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { PaymentsProvider } from "@/contexts/payments-context"
import { RecurrencesProvider } from "@/contexts/recurrences-context"
import { InternalReportsProvider } from "@/contexts/internal-reports-context"
import { ReviewsProvider } from "@/contexts/reviews-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <CompaniesProvider>
        <PlansProvider>
          <TeamsProvider>
            <ProfessionalsProvider>
              <CustomersProvider>
                <UsersProvider>
                  <AppointmentsProvider>
                    <CancellationsProvider>
                      <CheckRecordsProvider>
                        <GpsTrackingProvider>
                          <InternalFeedbackProvider>
                            <NotificationsProvider>
                              <PaymentsProvider>
                                <RecurrencesProvider>
                                  <InternalReportsProvider>
                                    <ReviewsProvider>
                                      <div className="flex h-screen bg-[#0f172a]">
                                        <AdminSidebar />
                                        <div className="flex-1 flex flex-col overflow-hidden">
                                          <AdminHeader />
                                          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0f172a] p-3 md:p-6">
                                            {children}
                                          </main>
                                        </div>
                                      </div>
                                    </ReviewsProvider>
                                  </InternalReportsProvider>
                                </RecurrencesProvider>
                              </PaymentsProvider>
                            </NotificationsProvider>
                          </InternalFeedbackProvider>
                        </GpsTrackingProvider>
                      </CheckRecordsProvider>
                    </CancellationsProvider>
                  </AppointmentsProvider>
                </UsersProvider>
              </CustomersProvider>
            </ProfessionalsProvider>
          </TeamsProvider>
        </PlansProvider>
      </CompaniesProvider>
    </SidebarProvider>
  )
}
