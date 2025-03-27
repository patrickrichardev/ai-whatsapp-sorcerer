
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Send, Smile } from "lucide-react"
import { useState } from "react"
import MessageTemplates from "./MessageTemplates"

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>
  isLoading: boolean
}

export default function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState("")
  
  const handleSend = async () => {
    if (!message.trim()) return
    await onSendMessage(message)
    setMessage("")
  }

  return (
    <footer className="p-4 border-t">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Smile className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Paperclip className="h-4 w-4" />
        </Button>
        <MessageTemplates 
          onSelectTemplate={(content) => setMessage(content)}
          currentMessage={message}
        />
        <Input
          placeholder="Digite uma mensagem..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          className="flex-1"
        />
        <Button 
          size="icon" 
          onClick={handleSend}
          disabled={isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </footer>
  )
}
