
import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, Copy, Heart, MessageSquare, Save } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  likes?: number
  hasHashtags?: boolean
}

const exampleResponses = [
  {
    content: `Aqui está uma ideia de legenda para o Instagram sobre autocuidado:

*"Pausas não são prêmios, são necessidades. ☕️✨*

Normalizar o autocuidado é entender que você não precisa estar esgotado para merecer um momento só seu.

O que você tem feito para cuidar da sua saúde mental hoje?

#AutoCuidado #SaúdeMental #BemEstar #EquilíbrioEmocional #MomentoPraVocê",`,
    hasHashtags: true
  },
  {
    content: `Roteiro para Reels - Tutorial de Maquiagem Rápida (60 segundos)

**Cena 1 (0-10s):**
👉 Apareça sem maquiagem, olhando para câmera
👉 Texto na tela: "Pronta em 5 minutos? É possível!"
👉 Áudio: Música animada e tendência

**Cena 2 (10-30s):**
👉 Mostre os produtos que vai usar (base, corretivo, blush, máscara)
👉 Técnica rápida: aplique base com os dedos
👉 Texto: "Dica: produtos cremosos são mais rápidos"

**Cena 3 (30-50s):**
👉 Aplique blush nas maçãs do rosto e esfume para as têmporas
👉 Máscara de cílios apenas nas pontas para um olhar aberto
👉 Texto: "Concentre-se no que faz diferença: olhos e bochechas"

**Cena 4 (50-60s):**
👉 Resultado final com comparação antes/depois
👉 Call to action: "Salve para testar depois!"
👉 Encerre com sua frase característica`,
    hasHashtags: false
  }
];

export default function SocialContentChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: "Olá! Sou seu assistente especializado em criação de conteúdo para redes sociais. Como posso ajudar você hoje?",
      role: "assistant",
      timestamp: new Date()
    }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const [isTyping, setIsTyping] = useState(false)

  // Function to simulate new message from AI
  const simulateAIResponse = (prompt: string) => {
    setIsTyping(true)
    
    setTimeout(() => {
      const responseIndex = prompt.toLowerCase().includes("reels") ? 1 : 0;
      const response = exampleResponses[responseIndex];
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: response.content,
        role: "assistant",
        timestamp: new Date(),
        hasHashtags: response.hasHashtags
      }
      
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 2000)
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])
  
  // For demonstration, simulate a conversation
  useEffect(() => {
    if (messages.length === 1) {
      // First time loading, simulate user message after a delay
      setTimeout(() => {
        const userMessage: Message = {
          id: `user-demo-1`,
          content: "Preciso de uma legenda criativa para um post sobre autocuidado no Instagram",
          role: "user",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        
        // Then simulate AI response
        simulateAIResponse(userMessage.content)
      }, 1000)
    }
  }, [])
  
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success("Conteúdo copiado para a área de transferência!")
  }

  const saveContent = () => {
    toast.success("Conteúdo salvo nas suas criações!")
  }

  const likeMessage = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, likes: (msg.likes || 0) + 1 } 
        : msg
    ))
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
                className={`max-w-[90%] md:max-w-[70%] p-4 rounded-2xl shadow-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src="/elia.png" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="space-y-1 flex-1">
                    <div className="text-sm font-medium">
                      {message.role === "user" ? "Você" : "Social Content Pro"}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      {message.role === "assistant" && (
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7" 
                            onClick={() => copyToClipboard(message.content)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7"
                            onClick={() => saveContent()}
                          >
                            <Save className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7 relative"
                            onClick={() => likeMessage(message.id)}
                          >
                            <Heart className="h-3.5 w-3.5" />
                            {message.likes && (
                              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                {message.likes}
                              </span>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* For messages with hashtags, highlight them */}
                    {message.role === "assistant" && message.hasHashtags && (
                      <div className="mt-3 bg-muted/60 p-2 rounded-lg">
                        <p className="text-xs font-medium mb-1">Hashtags sugeridas:</p>
                        <div className="flex flex-wrap gap-1">
                          {["#AutoCuidado", "#SaúdeMental", "#BemEstar", "#EquilíbrioEmocional"].map(tag => (
                            <span key={tag} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-card border border-border p-3 rounded-2xl flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/elia.png" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="text-sm font-medium">Social Content Pro</div>
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
