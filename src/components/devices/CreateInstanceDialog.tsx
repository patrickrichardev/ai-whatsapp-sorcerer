
import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { initializeWhatsAppInstance } from "@/lib/evolution-api/instance"
import { supabase } from "@/lib/supabase"

interface CreateInstanceDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  userId: string | undefined
  onSuccess: () => void
}

export function CreateInstanceDialog({ isOpen, onOpenChange, userId, onSuccess }: CreateInstanceDialogProps) {
  const [isCreatingInstance, setIsCreatingInstance] = useState(false)
  const [instanceName, setInstanceName] = useState("")

  const handleCreateInstance = async () => {
    if (!instanceName) {
      toast.error("Por favor, forneça um nome para a instância")
      return
    }
    
    setIsCreatingInstance(true)
    try {
      // Criar um "agente temporário" com ID único para associar a instância
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .insert({
          user_id: userId,
          name: instanceName,
          prompt: `Instância ${instanceName}`,
          temperature: 0.7
        })
        .select()
        .single()
      
      if (agentError) throw agentError
      
      const agentId = agent.id
      
      // Inicializar instância no Evolution API
      const response = await initializeWhatsAppInstance(agentId)
      
      if (!response.success) {
        throw new Error(response.error || "Falha ao criar instância")
      }
      
      toast.success("Instância criada com sucesso")
      onOpenChange(false)
      onSuccess()
      
      // Redirecionar para página de QR code se necessário
      if (response.status === 'awaiting_scan' && (response.qr || response.qrcode)) {
        window.location.href = `/connect-whatsapp/qr?agent=${agentId}`
      }
      
    } catch (error: any) {
      console.error("Erro ao criar instância:", error)
      toast.error(`Erro ao criar instância: ${error.message}`)
    } finally {
      setIsCreatingInstance(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Instância</DialogTitle>
          <DialogDescription>
            Forneça um nome para sua nova instância do WhatsApp
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="instance-name">Nome da Instância</Label>
            <Input 
              id="instance-name" 
              placeholder="Ex: Suporte, Vendas, etc."
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            onClick={handleCreateInstance}
            disabled={isCreatingInstance}
          >
            {isCreatingInstance ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Criando...
              </>
            ) : "Criar Instância"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
