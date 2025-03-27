
import { Button } from "@/components/ui/button"
import { Info, MoreVertical, Phone, UserPlus } from "lucide-react"
import { Chat } from "./ChatLayout"

interface ChatHeaderProps {
  chat: Chat
  onToggleDetails: () => void
}

export default function ChatHeader({ chat, onToggleDetails }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          {chat.name[0]}
        </div>
        <div>
          <h3 className="font-medium">{chat.name}</h3>
          {chat.agent && (
            <p className="text-xs text-muted-foreground">
              Atribuído para {chat.agent}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <UserPlus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleDetails}>
          <Info className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
