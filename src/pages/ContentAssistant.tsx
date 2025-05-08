
import { useState } from "react"
import { useTheme } from "@/components/theme/ThemeProvider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Menu, Share, MoreVertical } from "lucide-react"
import SocialContentChat from "@/components/chat/SocialContentChat"

export default function ContentAssistant() {
  const [isContextOpen, setIsContextOpen] = useState(true)
  const { theme } = useTheme()

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {/* Header - Fixed */}
      <header className="border-b p-3 flex justify-between items-center bg-card/50 backdrop-blur-sm z-10 h-14 w-full sticky top-0 shadow-sm">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <h1 className="text-lg font-medium">ChatGPT 4o</h1>
            <Button variant="ghost" size="sm" className="h-7 ml-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-9 px-3 gap-2">
            <Share className="h-4 w-4" />
            <span>Partilhar</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              PLUS
            </AvatarFallback>
          </Avatar>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden">
        {/* Main Chat Container */}
        <div className="flex-1 flex flex-col">
          {/* Chat area */}
          <div className="flex-1 overflow-hidden">
            <SocialContentChat 
              isContextOpen={isContextOpen}
              setIsContextOpen={setIsContextOpen}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
