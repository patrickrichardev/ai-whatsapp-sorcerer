
import { useState, useEffect } from "react"
import { useTheme } from "@/components/theme/ThemeProvider"
import { useAuth } from "@/contexts/AuthContext"
import ChatSidebar from "./ChatSidebar"
import MessageList from "./MessageList"
import ChatInput from "./ChatInput"

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  likes?: number;
  hasHashtags?: boolean;
}

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

export default function SocialContentChat() {
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

  // Function to handle sending a new message
  const handleSendMessage = (message: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: message,
      role: "user",
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    
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
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      {/* Left Sidebar */}
      <ChatSidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Messages Section */}
        <MessageList 
          messages={messages} 
          isTyping={isTyping} 
          onLikeMessage={handleLikeMessage}
        />
        
        {/* Input Box */}
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  )
}
