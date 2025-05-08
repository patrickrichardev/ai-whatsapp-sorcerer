
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { PanelLeft, Send, Mic, Image, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import MessageList, { Message } from "./MessageList"
import ChatSidebar from "./ChatSidebar"
import ContextPanel from "./ContextPanel"

// Sample responses for demonstration
const exampleResponses = [
  {
    content: `Aqui está uma ideia de legenda para o Instagram sobre autocuidado:

*"Pausas não são prêmios, são necessidades. ☕️✨*

Normalizar o autocuidado é entender que você não precisa estar esgotado para merecer um momento só seu.

O que você tem feito para cuidar da sua saúde mental hoje?

#AutoCuidado #SaúdeMental #BemEstar #EquilíbrioEmocional #MomentoPraVocê"`,
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

// Quick command suggestions
const quickCommands = [
  { icon: <MessageSquare className="h-4 w-4" />, label: "Criar legenda para Instagram" },
  { icon: <Image className="h-4 w-4" />, label: "Ideia de roteiro para Reels" },
  { icon: <MessageSquare className="h-4 w-4" />, label: "Calendário de postagens" },
  { icon: <Image className="h-4 w-4" />, label: "Criar carrossel educativo" },
  { icon: <MessageSquare className="h-4 w-4" />, label: "Sugestão de copy para anúncio" },
]

interface SocialContentChatProps {
  isContextOpen: boolean;
  setIsContextOpen: (isOpen: boolean) => void;
}

export default function SocialContentChat({
  isContextOpen,
  setIsContextOpen
}: SocialContentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: "Olá! Sou seu assistente especializado em criação de conteúdo para redes sociais. Como posso ajudar você hoje?",
      role: "assistant",
      timestamp: new Date()
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(true)
  const [inputValue, setInputValue] = useState("")

  // Function to handle sending a new message
  const handleSendMessage = (message: string) => {
    if (!message.trim()) return
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: message,
      role: "user",
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    
    // Simulate AI response
    simulateAIResponse(userMessage.content)
  }
  
  // Function to simulate new message from AI
  const simulateAIResponse = (prompt: string) => {
    setIsTyping(true)
    
    setTimeout(() => {
      const responseIndex = prompt.toLowerCase().includes("reels") ? 1 : 0
      const response = exampleResponses[responseIndex]
      
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
  
  // Function to handle liking a message
  const handleLikeMessage = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, likes: (msg.likes || 0) + 1 } 
        : msg
    ))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputValue)
    }
  }
  
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

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Sidebar */}
      <ChatSidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-b from-background to-muted/20">
        {/* Quick commands */}
        <div className="px-4 py-3 border-b overflow-x-auto">
          <div className="flex space-x-2">
            {quickCommands.map((command, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm" 
                className="whitespace-nowrap"
                onClick={() => setInputValue(command.label)}
              >
                {command.icon}
                <span>{command.label}</span>
              </Button>
            ))}
          </div>
        </div>
      
        {/* Messages Section */}
        <MessageList 
          messages={messages} 
          isTyping={isTyping} 
          onLikeMessage={handleLikeMessage}
        />
        
        {/* Input Box */}
        <div className="border-t bg-card/50 backdrop-blur-sm p-4 sticky bottom-0">
          <div className="max-w-4xl mx-auto flex flex-col">
            <div className="flex items-end gap-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Descreva o conteúdo que você precisa..."
                className="min-h-[60px] max-h-[200px] flex-1 resize-none overflow-auto rounded-xl"
                rows={2}
              />
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-xl h-8 w-8"
                  onClick={() => !isContextOpen && setIsContextOpen(true)}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim()}
                  className="rounded-xl h-8 w-8"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Image className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                AI Social Content Pro | v1.0
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Panel - Right */}
      {isContextOpen && (
        <ContextPanel onClose={() => setIsContextOpen(false)} />
      )}
    </div>
  )
}
