
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MessageSquare, 
  Clock,
  CheckCircle,
  Filter,
  Search,
  Calendar
} from "lucide-react"
import { Chat } from "./ChatLayout"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { ptBR } from "date-fns/locale"

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

        // Adiciona filtro por data se uma data estiver selecionada
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

    // Inscrever para atualizações em tempo real
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
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Conversas</h2>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant={selectedDate ? "default" : "ghost"} 
                  size="icon" 
                  className="h-8 w-8"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-3 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Filtrar por data</span>
                    {selectedDate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={handleClearDate}
                      >
                        Limpar
                      </Button>
                    )}
                  </div>
                </div>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  locale={ptBR}
                  className="rounded-md border-0"
                />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar conversa..." 
            className="pl-9 bg-background/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <nav className="grid grid-cols-3 gap-1 p-2 border-b bg-background/50">
        <Button 
          variant={filter === 'all' ? 'default' : 'ghost'} 
          size="sm" 
          className="h-9 px-2 text-sm"
          onClick={() => setFilter('all')}
        >
          <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Todas</span>
        </Button>
        <Button 
          variant={filter === 'waiting' ? 'default' : 'ghost'}
          size="sm" 
          className="h-9 px-2 text-sm"
          onClick={() => setFilter('waiting')}
        >
          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Em Espera</span>
        </Button>
        <Button 
          variant={filter === 'closed' ? 'default' : 'ghost'}
          size="sm" 
          className="h-9 px-2 text-sm"
          onClick={() => setFilter('closed')}
        >
          <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Encerradas</span>
        </Button>
      </nav>

      {selectedDate && (
        <div className="px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={handleClearDate}
            >
              Limpar
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={cn(
              "w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/50 relative transition-colors",
              selectedChat?.id === chat.id && "bg-muted"
            )}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
              {chat.name[0]}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate text-sm">{chat.name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {new Date(chat.updated_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {chat.last_message}
              </p>
              {chat.agent && (
                <p className="text-xs text-primary truncate mt-1">
                  {chat.agent} • {chat.department}
                </p>
              )}
            </div>
            {chat.unread_count > 0 && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {chat.unread_count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
