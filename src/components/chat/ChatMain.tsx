
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { sendWhatsAppMessage } from "@/lib/evolution-api"
import { Chat } from "./ChatLayout"
import ChatHeader from "./ChatHeader"
import MessageList, { Message } from "./MessageList"
import MessageInput from "./MessageInput"

interface ChatMainProps {
  chat: Chat
  onToggleDetails: () => void
}

export default function ChatMain({ chat, onToggleDetails }: ChatMainProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  // Load messages when chat changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', chat.id)
          .order('timestamp', { ascending: true })

        if (error) throw error
        
        // Map database messages to our Message type
        const formattedMessages = data.map((msg: any): Message => ({
          id: msg.id,
          content: msg.content,
          role: msg.sender_type === 'customer' ? 'user' : 'assistant',
          timestamp: new Date(msg.timestamp),
          sender_type: msg.sender_type
        }))
        
        setMessages(formattedMessages)
      } catch (error) {
        console.error('Error loading messages:', error)
        toast.error('Erro ao carregar mensagens')
      }
    }

    loadMessages()

    // Subscribe to real-time updates
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
          const newMsg = payload.new as any
          const formattedMsg: Message = {
            id: newMsg.id,
            content: newMsg.content,
            role: newMsg.sender_type === 'customer' ? 'user' : 'assistant',
            timestamp: new Date(newMsg.timestamp),
            sender_type: newMsg.sender_type
          }
          setMessages(current => [...current, formattedMsg])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chat.id])

  const handleSendMessage = async (message: string) => {
    setIsLoading(true)
    try {
      // Verificamos se temos uma conexão associada ao chat
      const { data: connections, error: connectionsError } = await supabase
        .from('agent_connections')
        .select('*')
        .eq('agent_id', chat.agent)
        .eq('is_active', true)
        .limit(1)
        .single()

      if (connectionsError || !connections) {
        throw new Error('Nenhuma conexão WhatsApp ativa encontrada')
      }

      // Send message via WhatsApp using the Evolution API
      const response = await sendWhatsAppMessage(
        connections.id,
        chat.customer_phone,
        message.trim()
      )

      if (!response.success) {
        throw new Error(response.error || "Erro ao enviar mensagem")
      }

      // Save message to database
      const { error: dbError } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chat.id,
          content: message.trim(),
          sender_type: 'agent',
          metadata: { agent_id: user?.id }
        })

      if (dbError) throw dbError

      // Update last message and counter
      await supabase
        .from('chat_conversations')
        .update({
          last_message: message.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', chat.id)

    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Erro ao enviar mensagem')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <ChatHeader chat={chat} onToggleDetails={onToggleDetails} />
      <MessageList messages={messages} />
      <MessageInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  )
}
