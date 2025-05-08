
import { useState } from "react"
import { Sidebar } from "../ui/sidebar"
import ChatDetails from "./ChatDetails"
import ChatMain from "./ChatMain" 

// Definindo a interface Chat completa
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
  customer_name?: string
}

// Importando o ChatSidebar modificado (sem o componente)
import ChatSidebar from "./ChatSidebar" 

// Interface para as props do ChatSidebar
interface ExtendedChatSidebarProps {
  onSelectChat: (chat: Chat) => void;
  selectedChat: Chat | null;
}

// Componente ChatLayout modificado
export default function ChatLayout() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(true)

  // Esta função resolve o problema de tipagem
  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Aqui usamos um componente personalizado para ChatSidebar que aceita nossas props */}
      <div className="flex h-full">
        {isMenuOpen && (
          <div className="bg-card border-r w-64 h-full shadow-lg flex flex-col">
            {/* Aqui você pode renderizar o conteúdo do ChatSidebar */}
            {/* como uma versão simplificada sem passar as props incorretas */}
            <div className="p-4 border-b">
              <h2 className="font-semibold">Conversas</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* Lista de chats que chama handleSelectChat quando clicado */}
            </div>
          </div>
        )}
      </div>
      
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
