
import { Button } from "@/components/ui/button"
import { X, Tags, Clock, User } from "lucide-react"
import { Chat } from "./ChatLayout"

interface ChatDetailsProps {
  chat: Chat
  onClose: () => void
}

export default function ChatDetails({ chat, onClose }: ChatDetailsProps) {
  return (
    <div className="w-80 border-l">
      <header className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Detalhes</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </header>

      <div className="p-4 space-y-6">
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            Informações do contato
          </h4>
          <div className="space-y-2 text-sm">
            <p><strong>Nome:</strong> {chat.name}</p>
            <p><strong>ID:</strong> {chat.id}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Detalhes do atendimento
          </h4>
          <div className="space-y-2 text-sm">
            <p><strong>Agente:</strong> {chat.agent || "Não atribuído"}</p>
            <p><strong>Departamento:</strong> {chat.department || "Não definido"}</p>
            <p><strong>Status:</strong> {chat.status === "open" ? "Em andamento" : "Finalizado"}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
              Novo cliente
            </span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
              Comercial
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
