
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MoreVertical,
  Phone,
  UserPlus,
  Smile,
  Paperclip,
  Send,
  Info
} from "lucide-react"
import { Chat } from "./ChatLayout"
import { useState } from "react"

interface ChatMainProps {
  chat: Chat
  onToggleDetails: () => void
}

export default function ChatMain({ chat, onToggleDetails }: ChatMainProps) {
  const [message, setMessage] = useState("")

  return (
    <div className="flex-1 flex flex-col min-w-0">
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

      <div className="flex-1 overflow-y-auto p-4">
        {/* Área de mensagens */}
      </div>

      <footer className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Smile className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Digite uma mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1"
          />
          <Button size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  )
}
