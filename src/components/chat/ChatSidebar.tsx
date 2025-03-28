
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Chat } from "./ChatLayout"
import ChatSidebarHeader from "./ChatSidebarHeader"
import ChatSidebarFilterTabs from "./ChatSidebarFilterTabs"
import DateFilterBanner from "./DateFilterBanner"
import ChatItem from "./ChatItem"

interface ChatSidebarProps {
  onSelectChat: (chat: Chat) => void
  selectedChat: Chat | null
}

export default function ChatSidebar({ onSelectChat, selectedChat }: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [filter, setFilter] = useState<'all' | 'waiting' | 'closed'>('all')
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadChats = async () => {
      setIsLoading(true)
      try {
        let query = supabase
          .from('chat_conversations')
          .select('*')
          .order('updated_at', { ascending: false })

        if (filter === 'waiting') {
          query = query.eq('status', 'open')
        } else if (filter === 'closed') {
          query = query.eq('status', 'closed')
        }

        // Add filter by date if selected
        if (selectedDate) {
          const startOfDay = new Date(selectedDate)
          startOfDay.setHours(0, 0, 0, 0)
          
          const endOfDay = new Date(selectedDate)
          endOfDay.setHours(23, 59, 59, 999)

          query = query
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString())
        }

        const { data, error } = await query

        if (error) throw error
        setChats(data)
      } catch (error) {
        console.error('Error loading chats:', error)
        toast.error('Erro ao carregar conversas')
      } finally {
        setIsLoading(false)
      }
    }

    loadChats()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('chat-list-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setChats(current => [payload.new as Chat, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setChats(current => 
              current.map(chat => 
                chat.id === payload.new.id ? payload.new as Chat : chat
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setChats(current => 
              current.filter(chat => chat.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter, selectedDate])

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.last_message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.customer_phone?.includes(searchTerm)
  )

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date || null)
  }

  const handleClearDate = () => {
    setSelectedDate(null)
  }

  return (
    <div className="w-80 border-r flex flex-col bg-card">
      <ChatSidebarHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDate={selectedDate}
        handleDateSelect={handleDateSelect}
        handleClearDate={handleClearDate}
      />
      
      <ChatSidebarFilterTabs filter={filter} setFilter={setFilter} />

      {selectedDate && (
        <DateFilterBanner 
          selectedDate={selectedDate} 
          handleClearDate={handleClearDate} 
        />
      )}

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatItem 
              key={chat.id} 
              chat={chat} 
              isSelected={selectedChat?.id === chat.id}
              onClick={() => onSelectChat(chat)} 
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground px-4 text-center">
            <p>Nenhuma conversa encontrada</p>
            {filter !== 'all' && (
              <button 
                onClick={() => setFilter('all')} 
                className="text-primary text-sm mt-2 hover:underline"
              >
                Mostrar todas as conversas
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
