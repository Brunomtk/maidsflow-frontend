import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Camera, Clock, CheckCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export default function ProfessionalCheckOut() {
  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="space-y-1 md:space-y-2">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Check-out</h2>
        <p className="text-sm md:text-base text-muted-foreground">Register the completion of your service</p>
      </div>

      <Tabs defaultValue="photos" className="space-y-3 md:space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="photos" className="text-xs md:text-sm">
            Photos & Confirmation
          </TabsTrigger>
          <TabsTrigger value="details" className="text-xs md:text-sm">
            Service Details
          </TabsTrigger>
        </TabsList>
        <TabsContent value="photos" className="space-y-3 md:space-y-4">
          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-base md:text-lg">Register Check-out</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Take photos of the location after cleaning and confirm service completion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                <div className="space-y-2">
                  <Label htmlFor="before-photo" className="text-sm font-medium">
                    Location Photo (Before)
                  </Label>
                  <div className="border rounded-md p-1">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center">
                      <p className="text-xs md:text-sm text-muted-foreground">Photo taken at check-in</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="after-photo" className="text-sm font-medium">
                    Location Photo (After)
                  </Label>
                  <div className="border-2 border-dashed rounded-md p-4 md:p-6 flex flex-col items-center justify-center min-h-[120px] md:min-h-[140px] touch-manipulation">
                    <Camera className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground mb-2" />
                    <p className="text-xs md:text-sm text-muted-foreground text-center">
                      Tap to take a photo or upload
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observations" className="text-sm font-medium">
                  Observations
                </Label>
                <Textarea
                  id="observations"
                  placeholder="Describe how the service went, difficulties encountered, or other important observations"
                  rows={4}
                  className="text-sm md:text-base resize-none"
                />
              </div>
              <Button className="w-full h-11 md:h-10 text-sm md:text-base font-medium">Confirm Check-out</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-base md:text-lg">Your Location</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Confirm you are at the correct service location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs md:text-sm text-muted-foreground">Location map</p>
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md flex items-start gap-2">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium text-green-800 dark:text-green-300">
                    You are at the correct location
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">Location confirmed for check-out</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details" className="space-y-3 md:space-y-4">
          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-base md:text-lg">Service Details</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Information about the current appointment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-medium block">Time:</span>
                    <span className="text-sm text-muted-foreground">2:30 PM - 4:30 PM</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-medium block">Address:</span>
                    <span className="text-sm text-muted-foreground break-words">123 Flower Street - Downtown</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Client:</h4>
                  <p className="text-sm text-muted-foreground">John Smith</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Service Type:</h4>
                  <p className="text-sm text-muted-foreground">Residential Cleaning</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Check-in completed:</h4>
                  <p className="text-sm text-muted-foreground">2:32 PM (2 minutes late)</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Time elapsed:</h4>
                  <p className="text-sm text-muted-foreground">1h 28min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
