
import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { Send, Mic, Image, MessageSquare, PlusIcon, Globe, Lightbulb, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import MessageList, { Message } from "./MessageList"
import ChatSidebar from "./ChatSidebar"
import ContextPanel from "./ContextPanel"
import { cn } from "@/lib/utils"

// Sample welcome message for demonstration
const welcomeMessage: Message = {
  id: "welcome-message",
  content: `Aqui está o protótipo visual do painel:

[Baixar imagem do layout](https://exemplo.com/imagem.jpg)`,
  role: "assistant",
  timestamp: new Date(),
  hasAttachment: true
};

// Sample responses for demonstration
const exampleResponses = [
  {
    content: `Aqui estão algumas idéias para seu layout:

1. Mantenha os tons de azul e verde para transmitir confiança
2. Use ícones mais minimalistas nas áreas de navegação
3. Adicione mais espaço entre os elementos para melhorar a legibilidade
4. Considere fontes sans-serif para uma aparência mais moderna

Gostaria que eu elaborasse alguma dessas idéias em particular?`,
    hasActions: true
  },
  {
    content: `Pesquisei por exemplos de painéis de IA para redes sociais que possam inspirar mais opções de estilo.

Aqui estão algumas tendências atuais:
- Interfaces com modo escuro como padrão
- Elementos de UI com bordas arredondadas
- Uso de ícones consistentes
- Áreas de sugestão claramente delimitadas
- Feedback visual imediato para ações do usuário

Posso compartilhar exemplos visuais se desejar.`,
    hasActions: false
  }
];

// Suggestion prompts
const suggestionPrompts = [
  { 
    icon: <Globe className="h-4 w-4" />, 
    label: "Pesquise por exemplos de painéis de IA para redes sociais que possam inspirar mais opções de estilo." 
  },
  { 
    icon: <Lightbulb className="h-4 w-4" />, 
    label: "Pesquise alternativas de design para otimizar a experiência do usuário com a IA de criação de conteúdo." 
  },
];

// Command toolbar items
const toolbarItems = [
  { icon: <PlusIcon className="h-4 w-4" />, label: "" },
  { icon: <Search className="h-4 w-4" />, label: "Procurar" },
  { icon: <MessageSquare className="h-4 w-4" />, label: "Investigar a fundo" },
  { icon: <Image className="h-4 w-4" />, label: "Criar imagem" },
];

interface SocialContentChatProps {
  isContextOpen: boolean;
  setIsContextOpen: (isOpen: boolean) => void;
}

export default function SocialContentChat({
  isContextOpen,
  setIsContextOpen
}: SocialContentChatProps) {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage])
  const [isTyping, setIsTyping] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [currentSuggestion, setCurrentSuggestion] = useState<number | null>(null)

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
    setCurrentSuggestion(null)
    
    // Simulate AI response
    simulateAIResponse()
  }
  
  // Function to simulate new message from AI
  const simulateAIResponse = () => {
    setIsTyping(true)
    
    setTimeout(() => {
      const responseIndex = Math.floor(Math.random() * exampleResponses.length)
      const response = exampleResponses[responseIndex]
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: response.content,
        role: "assistant",
        timestamp: new Date(),
        hasActions: response.hasActions
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
  
  const handleSuggestionClick = (index: number) => {
    setCurrentSuggestion(index)
    setInputValue(suggestionPrompts[index].label)
  }
  
  // For demonstration, simulate follow-up suggestion if needed
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === "welcome-message") {
      // Show follow-up message after welcome
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: "follow-up",
            content: "Gostou do layout? Quer ajustar algum detalhe no protótipo?",
            role: "assistant" as const, // Using const assertion to fix type issue
            timestamp: new Date()
          }
        ])
      }, 1000)
    }
  }, [])

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left Sidebar */}
      <ChatSidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Messages Section */}
        <div className="flex-1 overflow-y-auto px-4 md:px-20 lg:px-32 max-w-5xl mx-auto w-full">
          <MessageList 
            messages={messages} 
            isTyping={isTyping} 
            onLikeMessage={handleLikeMessage}
          />
          
          {/* Suggestion Prompts */}
          {messages.length > 0 && !isTyping && (
            <div className="my-6 space-y-4 max-w-3xl mx-auto">
              {suggestionPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 py-3 px-4 text-left text-muted-foreground border rounded-lg hover:bg-muted hover:text-foreground",
                    currentSuggestion === index && "bg-muted/50"
                  )}
                  onClick={() => handleSuggestionClick(index)}
                >
                  {prompt.icon}
                  <span className="text-sm">{prompt.label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
        
        {/* Input Box */}
        <div className="border-t bg-background p-4 sticky bottom-0 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-xl border shadow-sm bg-background">
              {/* Toolbar */}
              <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center space-x-1 py-2">
                <div className="bg-background border rounded-full flex items-center shadow-sm">
                  {toolbarItems.map((item, idx) => (
                    <Button 
                      key={idx}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "rounded-full px-4 py-2 text-muted-foreground",
                        idx === 0 && "border-r"
                      )}
                    >
                      {item.icon}
                      {item.label && <span className="ml-2">{item.label}</span>}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Pergunte qualquer coisa"
                className="min-h-[60px] max-h-[200px] resize-none overflow-auto rounded-xl border-0 py-3 px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={1}
              />
              
              <div className="absolute right-2 bottom-2 flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim()}
                  className="h-8 w-8 rounded-full"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-2 text-center text-xs text-muted-foreground">
              O ChatGPT pode cometer erros. Considere verificar informações importantes.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
