
import { cn } from "@/lib/utils"
import { Chat } from "./ChatLayout"

interface ChatItemProps {
  chat: Chat
  isSelected: boolean
  onClick: () => void
}

export default function ChatItem({ chat, isSelected, onClick }: ChatItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/50 relative transition-colors",
        isSelected && "bg-muted"
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
  )
}
