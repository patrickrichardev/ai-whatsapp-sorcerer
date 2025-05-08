
import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: "Olá! Sou seu assistente especializado em criação de conteúdo. Como posso ajudar você hoje?",
      role: "assistant",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      role: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Simulate AI response (this would be replaced with actual API call)
      setTimeout(() => {
        const aiResponses = [
          "Entendi sua necessidade! Para criar um conteúdo eficaz, precisamos considerar o público-alvo, o objetivo e a plataforma onde será publicado.",
          "Ótima ideia! Posso ajudar você a estruturar esse conteúdo de forma mais envolvente. Vamos começar com um título impactante.",
          "Para esse tipo de conteúdo, recomendo utilizar histórias e exemplos práticos que criem conexão emocional com seu público.",
          "Sua estratégia está no caminho certo. Podemos aprimorar adicionando dados e estatísticas relevantes para dar mais credibilidade.",
          "Excelente abordagem! Sugiro complementar com uma call-to-action clara ao final para direcionar seu público ao próximo passo."
        ]

        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          content: randomResponse,
          role: "assistant",
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-3/4 p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <div className="flex items-start gap-3">
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
                  </Avatar>
                )}
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {message.role === "user" ? "Você" : "Assistente de Conteúdo"}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escreva sua mensagem..."
            className="min-h-[60px] flex-1 resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="self-end"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-center mt-2 text-muted-foreground">
          Assistente especializado em criação de conteúdo
        </p>
      </div>
    </div>
  )
}
