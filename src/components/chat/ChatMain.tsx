
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
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { sendWhatsAppMessage } from "@/lib/evolution-api"
import MessageTemplates from "./MessageTemplates"

interface ChatMainProps {
  chat: Chat
  onToggleDetails: () => void
}

interface Message {
  id: string
  content: string
  sender_type: 'customer' | 'agent'
  timestamp: string
  metadata?: any
}

export default function ChatMain({ chat, onToggleDetails }: ChatMainProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Carregar mensagens
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', chat.id)
          .order('timestamp', { ascending: true })

        if (error) throw error
        setMessages(data)
      } catch (error) {
        console.error('Error loading messages:', error)
        toast.error('Erro ao carregar mensagens')
      }
    }

    loadMessages()

    // Inscrever para atualizações em tempo real
    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chat.id}`
        },
        (payload) => {
          setMessages(current => [...current, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chat.id])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    try {
      // Enviar mensagem via WhatsApp usando a Evolution API
      const response = await sendWhatsAppMessage(
        chat.customer_phone,
        message.trim()
      )

      if (!response.success) {
        throw new Error(response.error || "Erro ao enviar mensagem")
      }

      // Salvar mensagem no banco
      const { error: dbError } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chat.id,
          content: message.trim(),
          sender_type: 'agent',
          metadata: { agent_id: user?.id }
        })

      if (dbError) throw dbError

      // Atualizar última mensagem e contador
      await supabase
        .from('chat_conversations')
        .update({
          last_message: message.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', chat.id)

      setMessage("")
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Erro ao enviar mensagem')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectTemplate = (templateContent: string) => {
    setMessage(templateContent);
  };

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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                msg.sender_type === 'agent'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p>{msg.content}</p>
              <span className="text-xs opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Smile className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <MessageTemplates 
            onSelectTemplate={handleSelectTemplate}
            currentMessage={message}
          />
          <Input
            placeholder="Digite uma mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            className="flex-1"
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage}
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  )
}
