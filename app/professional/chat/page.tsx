"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, PaperclipIcon, ImageIcon, ArrowLeft, MessageCircle } from "lucide-react"

export default function ProfessionalChat() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId)
  }

  const handleBackToList = () => {
    setSelectedChat(null)
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="flex items-center gap-3">
        {selectedChat && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            {selectedChat ? "Chat" : "Chat with Supervisor"}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {selectedChat ? "Mark Smith - Supervisor" : "Communicate directly with your supervisor"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className={`md:col-span-1 order-2 md:order-1 ${selectedChat ? "hidden md:block" : "block"}`}>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
              Conversations
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Your recent conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-200px)] md:h-[calc(100vh-300px)]">
              <div className="space-y-3">
                <div
                  className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 border cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleChatSelect("mark-smith")}
                >
                  <Avatar className="h-10 w-10 md:h-12 md:w-12">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Supervisor" />
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">Mark Smith</p>
                    <p className="text-xs text-muted-foreground truncate">Supervisor - Team A</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-xs text-muted-foreground">Today</span>
                    <span className="w-2 h-2 bg-primary rounded-full mt-1"></span>
                  </div>
                </div>

                <div
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleChatSelect("rachel-cooper")}
                >
                  <Avatar className="h-10 w-10 md:h-12 md:w-12">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Coordinator" />
                    <AvatarFallback>RC</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">Rachel Cooper</p>
                    <p className="text-xs text-muted-foreground truncate">General Coordinator</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-xs text-muted-foreground">Yesterday</span>
                  </div>
                </div>

                <div
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleChatSelect("team-a")}
                >
                  <Avatar className="h-10 w-10 md:h-12 md:w-12">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Team" />
                    <AvatarFallback>TA</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">Team A</p>
                    <p className="text-xs text-muted-foreground truncate">Group (5 members)</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-xs text-muted-foreground">05/22</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className={`md:col-span-2 order-1 md:order-2 ${!selectedChat ? "hidden md:block" : "block"}`}>
          <CardHeader className="flex flex-row items-center pb-3 md:pb-6">
            <div className="flex items-center space-x-3 md:space-x-4">
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Supervisor" />
                <AvatarFallback>MS</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base md:text-lg">Mark Smith</CardTitle>
                <CardDescription className="text-xs md:text-sm">Supervisor - Team A</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-280px)] md:h-[calc(100vh-350px)] px-4 md:px-6">
              <div className="space-y-4 py-4">
                <div className="flex gap-2 md:gap-3">
                  <Avatar className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Supervisor" />
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm font-medium">Mark Smith</span>
                      <span className="text-xs text-muted-foreground">09:15</span>
                    </div>
                    <div className="bg-muted p-2 md:p-3 rounded-lg rounded-tl-none max-w-[85%] md:max-w-[80%]">
                      <p className="text-xs md:text-sm">
                        Good morning! How's the service at the Flores residence? Did you find the location without any
                        issues?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 md:gap-3 justify-end">
                  <div className="flex flex-col gap-1 items-end min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">09:22</span>
                      <span className="text-xs md:text-sm font-medium">You</span>
                    </div>
                    <div className="bg-primary text-primary-foreground p-2 md:p-3 rounded-lg rounded-tr-none max-w-[85%] md:max-w-[80%]">
                      <p className="text-xs md:text-sm">
                        Good morning, Mark! Yes, I arrived on time and have already started the service. The client left
                        the keys with the doorman as arranged.
                      </p>
                    </div>
                  </div>
                  <Avatar className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="You" />
                    <AvatarFallback>YO</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex gap-2 md:gap-3">
                  <Avatar className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Supervisor" />
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm font-medium">Mark Smith</span>
                      <span className="text-xs text-muted-foreground">09:25</span>
                    </div>
                    <div className="bg-muted p-2 md:p-3 rounded-lg rounded-tl-none max-w-[85%] md:max-w-[80%]">
                      <p className="text-xs md:text-sm">
                        Great! Remember that this client requested special attention to the bathrooms and kitchen. Let
                        me know if you encounter any issues.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 md:gap-3 justify-end">
                  <div className="flex flex-col gap-1 items-end min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">09:30</span>
                      <span className="text-xs md:text-sm font-medium">You</span>
                    </div>
                    <div className="bg-primary text-primary-foreground p-2 md:p-3 rounded-lg rounded-tr-none max-w-[85%] md:max-w-[80%]">
                      <p className="text-xs md:text-sm">
                        Will do! I'm following all the instructions. I should finish within the scheduled time.
                      </p>
                    </div>
                  </div>
                  <Avatar className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="You" />
                    <AvatarFallback>YO</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex gap-2 md:gap-3">
                  <Avatar className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Supervisor" />
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm font-medium">Mark Smith</span>
                      <span className="text-xs text-muted-foreground">09:32</span>
                    </div>
                    <div className="bg-muted p-2 md:p-3 rounded-lg rounded-tl-none max-w-[85%] md:max-w-[80%]">
                      <p className="text-xs md:text-sm">
                        Perfect! Please send before/after photos to include in the report. Good work!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 md:gap-3 justify-end">
                  <div className="flex flex-col gap-1 items-end min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">09:35</span>
                      <span className="text-xs md:text-sm font-medium">You</span>
                    </div>
                    <div className="bg-primary text-primary-foreground p-2 md:p-3 rounded-lg rounded-tr-none max-w-[85%] md:max-w-[80%]">
                      <p className="text-xs md:text-sm">I'll send them! Thanks for the support.</p>
                    </div>
                  </div>
                  <Avatar className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="You" />
                    <AvatarFallback>YO</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </ScrollArea>

            <div className="p-3 md:p-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-8 w-8 md:h-10 md:w-10 flex-shrink-0 bg-transparent"
                >
                  <PaperclipIcon className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-8 w-8 md:h-10 md:w-10 flex-shrink-0 bg-transparent"
                >
                  <ImageIcon className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
                <Input placeholder="Type your message..." className="flex-1 text-sm md:text-base h-8 md:h-10" />
                <Button size="icon" className="rounded-full h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                  <Send className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!selectedChat && (
        <div className="md:hidden flex flex-col items-center justify-center py-12 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
          <p className="text-sm text-muted-foreground">Choose a conversation from the list above to start chatting</p>
        </div>
      )}
    </div>
  )
}
