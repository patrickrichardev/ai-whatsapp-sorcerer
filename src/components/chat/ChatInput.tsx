
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [currentMessage, setCurrentMessage] = useState("")

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return
    onSendMessage(currentMessage)
    setCurrentMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
      <div className="flex items-end gap-2">
        <Textarea
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Digite sua mensagem aqui..."
          className="min-h-[60px] max-h-[200px] resize-none"
          rows={1}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!currentMessage.trim()}
          className="h-10 px-4 shrink-0"
        >
          Enviar
        </Button>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Pressione Enter para enviar ou Shift+Enter para quebrar linha
      </div>
    </div>
  );
};

export default ChatInput;
