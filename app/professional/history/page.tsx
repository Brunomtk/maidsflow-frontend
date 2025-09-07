import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, MapPin, Search, Eye, XCircle } from "lucide-react"

export default function ProfessionalHistory() {
  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="space-y-1 md:space-y-2">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Service History</h2>
        <p className="text-sm md:text-base text-muted-foreground">View all your completed services</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:gap-4 md:items-center md:justify-between">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by client or address..."
            className="pl-8 w-full md:w-[300px] text-sm md:text-base"
          />
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:gap-2 w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-[180px] text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="30">
            <SelectTrigger className="w-full md:w-[180px] text-sm">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-3 md:space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="all" className="text-xs md:text-sm px-2 py-2">
            All
          </TabsTrigger>
          <TabsTrigger value="residential" className="text-xs md:text-sm px-2 py-2">
            Residential
          </TabsTrigger>
          <TabsTrigger value="commercial" className="text-xs md:text-sm px-2 py-2">
            Commercial
          </TabsTrigger>
          <TabsTrigger value="post-construction" className="text-xs md:text-sm px-2 py-2">
            Post-Const.
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-3 md:space-y-4">
          <Card>
            <CardHeader className="px-4 md:px-6 py-3 md:py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base md:text-lg">May 2023</CardTitle>
                <div className="text-xs md:text-sm text-muted-foreground">12 services</div>
              </div>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <div className="space-y-3 md:space-y-4">
                <div className="border rounded-lg p-3 md:p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit text-xs">
                          Completed
                        </Badge>
                        <span className="text-xs md:text-sm text-muted-foreground">05/25/2023</span>
                      </div>
                      <h3 className="text-sm md:text-base font-semibold">Residential Cleaning</h3>
                      <div className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 mt-0.5 flex-shrink-0" />
                        <span className="break-words">Flores Residential, Apt 302</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                      <div className="flex flex-col gap-1 md:items-start">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                          <span className="text-xs md:text-sm">09:00 - 12:00</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs md:text-sm font-medium">5.0</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full md:w-auto text-xs bg-transparent">
                        <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-3 md:p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit text-xs">
                          Completed
                        </Badge>
                        <span className="text-xs md:text-sm text-muted-foreground">05/23/2023</span>
                      </div>
                      <h3 className="text-sm md:text-base font-semibold">Commercial Cleaning</h3>
                      <div className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 mt-0.5 flex-shrink-0" />
                        <span className="break-words">Central Office, 5th floor</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                      <div className="flex flex-col gap-1 md:items-start">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                          <span className="text-xs md:text-sm">14:00 - 17:00</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs md:text-sm font-medium">4.0</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full md:w-auto text-xs bg-transparent">
                        <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-3 md:p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit text-xs">
                          Completed
                        </Badge>
                        <span className="text-xs md:text-sm text-muted-foreground">05/21/2023</span>
                      </div>
                      <h3 className="text-sm md:text-base font-semibold">Post-Construction Cleaning</h3>
                      <div className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 mt-0.5 flex-shrink-0" />
                        <span className="break-words">Green View Condominium, Block B, Apt 101</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                      <div className="flex flex-col gap-1 md:items-start">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                          <span className="text-xs md:text-sm">08:00 - 13:00</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs md:text-sm font-medium">5.0</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full md:w-auto text-xs bg-transparent">
                        <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-3 md:p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 w-fit text-xs">
                          Canceled
                        </Badge>
                        <span className="text-xs md:text-sm text-muted-foreground">05/18/2023</span>
                      </div>
                      <h3 className="text-sm md:text-base font-semibold">Residential Cleaning</h3>
                      <div className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 mt-0.5 flex-shrink-0" />
                        <span className="break-words">Tree Park Residential, House 15</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                      <div className="flex flex-col gap-1 md:items-start">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                          <span className="text-xs md:text-sm">10:00 - 12:00</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-500">
                          <XCircle className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="text-xs md:text-sm">Client absent</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full md:w-auto text-xs bg-transparent">
                        <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-3 md:p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit text-xs">
                          Completed
                        </Badge>
                        <span className="text-xs md:text-sm text-muted-foreground">05/15/2023</span>
                      </div>
                      <h3 className="text-sm md:text-base font-semibold">Commercial Cleaning</h3>
                      <div className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 mt-0.5 flex-shrink-0" />
                        <span className="break-words">Total Health Clinic, Reception and Offices</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                      <div className="flex flex-col gap-1 md:items-start">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                          <span className="text-xs md:text-sm">19:00 - 22:00</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs md:text-sm font-medium">4.5</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full md:w-auto text-xs bg-transparent">
                        <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center mt-4 md:mt-6">
                <Button variant="outline" className="w-full md:w-auto text-sm bg-transparent">
                  Load more
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="residential" className="space-y-3 md:space-y-4">
          <Card>
            <CardHeader className="px-4 md:px-6 py-3 md:py-4">
              <CardTitle className="text-base md:text-lg">Residential Cleanings</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                History of services in residential properties
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <div className="text-center py-6 md:py-8 text-muted-foreground text-sm">
                Content filtered by residential cleanings will be displayed here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commercial" className="space-y-3 md:space-y-4">
          <Card>
            <CardHeader className="px-4 md:px-6 py-3 md:py-4">
              <CardTitle className="text-base md:text-lg">Commercial Cleanings</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                History of services in commercial establishments
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <div className="text-center py-6 md:py-8 text-muted-foreground text-sm">
                Content filtered by commercial cleanings will be displayed here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="post-construction" className="space-y-3 md:space-y-4">
          <Card>
            <CardHeader className="px-4 md:px-6 py-3 md:py-4">
              <CardTitle className="text-base md:text-lg">Post-Construction Cleanings</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                History of services in locations after construction or renovation
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <div className="text-center py-6 md:py-8 text-muted-foreground text-sm">
                Content filtered by post-construction cleanings will be displayed here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
