
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

  useEffect(() => {
    const loadChats = async () => {
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
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter, selectedDate])

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
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

      <DateFilterBanner 
        selectedDate={selectedDate} 
        handleClearDate={handleClearDate} 
      />

      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <ChatItem 
            key={chat.id} 
            chat={chat} 
            isSelected={selectedChat?.id === chat.id}
            onClick={() => onSelectChat(chat)} 
          />
        ))}
      </div>
    </div>
  )
}
