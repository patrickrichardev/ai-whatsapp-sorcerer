
import { useState } from "react"
import ChatSidebar from "./ChatSidebar"
import ChatMain from "./ChatMain"
import ChatDetails from "./ChatDetails"

export interface Chat {
  id: string
  name: string
  last_message?: string
  updated_at: string
  status: "open" | "closed"
  agent?: string
  department?: string
  unread_count?: number
  customer_phone: string
}

export default function ChatLayout() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ChatSidebar onSelectChat={setSelectedChat} selectedChat={selectedChat} />
      {selectedChat ? (
        <>
          <ChatMain chat={selectedChat} onToggleDetails={() => setShowDetails(!showDetails)} />
          {showDetails && <ChatDetails chat={selectedChat} onClose={() => setShowDetails(false)} />}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2 max-w-sm mx-auto px-4">
            <h3 className="text-lg font-medium">Nenhuma conversa selecionada</h3>
            <p className="text-sm text-muted-foreground">
              Selecione uma conversa ao lado para começar o atendimento
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
