
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MessageSquare, 
  Clock,
  CheckCircle,
  Filter,
  Search
} from "lucide-react"
import { Chat } from "./ChatLayout"
import { cn } from "@/lib/utils"

interface ChatSidebarProps {
  onSelectChat: (chat: Chat) => void
  selectedChat: Chat | null
}

export default function ChatSidebar({ onSelectChat, selectedChat }: ChatSidebarProps) {
  const chats: Chat[] = [
    {
      id: "1",
      name: "Carol Maravilha",
      lastMessage: "VAMOS",
      timestamp: "09:51",
      status: "open",
      agent: "Matheus Boari",
      department: "Comercial"
    },
    {
      id: "2",
      name: "Jéssica Caroline Soares",
      lastMessage: "Olá, gostaria de informações",
      timestamp: "09:45",
      status: "open",
      unread: 2
    },
  ]

  return (
    <div className="w-80 border-r flex flex-col bg-card">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Conversas</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar conversa..." 
            className="pl-9 bg-background/50"
          />
        </div>
      </div>
      
      <nav className="grid grid-cols-3 gap-1 p-2 border-b bg-background/50">
        <Button variant="ghost" size="sm" className="h-9 px-2 text-sm">
          <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Todas</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-9 px-2 text-sm">
          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Em Espera</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-9 px-2 text-sm">
          <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Encerradas</span>
        </Button>
      </nav>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
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
                <span className="text-xs text-muted-foreground flex-shrink-0">{chat.timestamp}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{chat.lastMessage}</p>
              {chat.agent && (
                <p className="text-xs text-primary truncate mt-1">
                  {chat.agent} • {chat.department}
                </p>
              )}
            </div>
            {chat.unread && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {chat.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
