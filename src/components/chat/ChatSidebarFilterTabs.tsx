
import { Button } from "@/components/ui/button"
import { MessageSquare, Clock, CheckCircle } from "lucide-react"

interface ChatSidebarFilterTabsProps {
  filter: 'all' | 'waiting' | 'closed'
  setFilter: (filter: 'all' | 'waiting' | 'closed') => void
}

export default function ChatSidebarFilterTabs({ 
  filter, 
  setFilter 
}: ChatSidebarFilterTabsProps) {
  return (
    <nav className="grid grid-cols-3 gap-1 p-2 border-b bg-muted/30">
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
  )
}
