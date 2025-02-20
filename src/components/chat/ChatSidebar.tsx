
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
    <div className="w-80 border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-semibold">Conversas</h2>
          <Button variant="ghost" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar conversa..." 
            className="pl-9"
          />
        </div>
      </div>
      
      <nav className="flex border-b px-1 py-2">
        <Button variant="ghost" size="sm" className="flex-1">
          <MessageSquare className="h-4 w-4 mr-2" />
          Todas
        </Button>
        <Button variant="ghost" size="sm" className="flex-1">
          <Clock className="h-4 w-4 mr-2" />
          Em Espera
        </Button>
        <Button variant="ghost" size="sm" className="flex-1">
          <CheckCircle className="h-4 w-4 mr-2" />
          Encerradas
        </Button>
      </nav>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={cn(
              "w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/50 relative",
              selectedChat?.id === chat.id && "bg-muted"
            )}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {chat.name[0]}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{chat.name}</span>
                <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
              {chat.agent && (
                <p className="text-xs text-primary truncate">
                  {chat.agent} • {chat.department}
                </p>
              )}
            </div>
            {chat.unread && (
              <span className="absolute right-4 top-8 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {chat.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
