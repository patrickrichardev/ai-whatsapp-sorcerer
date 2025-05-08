
import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, Bot } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  // Auto-focus on textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`max-w-3/4 md:max-w-2/3 p-4 rounded-2xl shadow-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground ml-12"
                    : "bg-card border border-border mr-12"
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="space-y-1 flex-1">
                    <div className="text-sm font-medium">
                      {message.role === "user" ? "Você" : "Assistente de Conteúdo"}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-card border border-border p-4 rounded-2xl flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="text-sm font-medium">Assistente de Conteúdo</div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-100"></div>
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-200"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-card/50 backdrop-blur-sm p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyPress}
              placeholder="Escreva sua mensagem..."
              className="min-h-[60px] max-h-[200px] flex-1 resize-none overflow-auto rounded-xl border-muted bg-background shadow-sm focus:ring-1 focus:ring-primary/20 transition-all"
              disabled={isLoading}
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="rounded-xl h-[60px] px-4"
              size="icon"
            >
              {isLoading ? 
                <Loader2 className="h-5 w-5 animate-spin" /> : 
                <Send className="h-5 w-5" />
              }
            </Button>
          </div>
          <p className="text-xs text-center mt-2 text-muted-foreground">
            Assistente especializado em criação de conteúdo
          </p>
        </div>
      </div>
    </div>
  )
}
