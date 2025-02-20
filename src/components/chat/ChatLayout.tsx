
import { useState } from "react"
import ChatSidebar from "./ChatSidebar"
import ChatMain from "./ChatMain"
import ChatDetails from "./ChatDetails"

export interface Chat {
  id: string
  name: string
  lastMessage?: string
  timestamp: string
  status: "open" | "closed"
  agent?: string
  department?: string
  unread?: number
}

export default function ChatLayout() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="flex h-[calc(100vh-80px)] bg-background rounded-lg border overflow-hidden">
      <ChatSidebar onSelectChat={setSelectedChat} selectedChat={selectedChat} />
      {selectedChat ? (
        <>
          <ChatMain chat={selectedChat} onToggleDetails={() => setShowDetails(!showDetails)} />
          {showDetails && <ChatDetails chat={selectedChat} onClose={() => setShowDetails(false)} />}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Selecione uma conversa para começar
        </div>
      )}
    </div>
  )
}
