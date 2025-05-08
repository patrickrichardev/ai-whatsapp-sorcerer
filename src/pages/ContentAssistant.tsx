
import { useState } from "react"
import { useTheme } from "@/components/theme/ThemeProvider"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import SocialContentChat from "@/components/chat/SocialContentChat"

export default function ContentAssistant() {
  const [isContextOpen, setIsContextOpen] = useState(true)
  const { theme } = useTheme()

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {/* Header - Fixed */}
      <header className="border-b p-3 flex justify-between items-center bg-card/50 backdrop-blur-sm z-10 h-16 w-full sticky top-0 shadow-sm">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold">Social Content Pro</h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded-full">
            Assistente de mídias sociais
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
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
        
        {/* Context Panel Button (only visible when context is closed) */}
        {!isContextOpen && (
          <Button 
            variant="outline" 
            size="sm" 
            className="fixed bottom-24 right-4 z-20"
            onClick={() => setIsContextOpen(true)}
          >
            <PanelLeft className="h-4 w-4 mr-2" />
            Abrir configurações
          </Button>
        )}
      </div>
    </div>
  )
}
