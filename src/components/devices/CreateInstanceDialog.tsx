
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
    
    if (!userId) {
      toast.error("Usuário não identificado")
      return
    }
    
    setIsCreatingInstance(true)
    try {
      // Create a WhatsApp connection record directly with a unique ID
      const connectionId = crypto.randomUUID()
      
      // Create the connection record
      const { error: connectionError } = await supabase
        .from('agent_connections')
        .insert({
          id: connectionId,
          platform: 'whatsapp',
          is_active: false,
          connection_data: { 
            name: instanceName,
            status: 'creating' 
          }
        })
      
      if (connectionError) throw connectionError
      
      // Initialize the WhatsApp instance in Evolution API
      const response = await initializeWhatsAppInstance(connectionId)
      
      if (!response.success) {
        // Clean up the record if the API call fails
        await supabase
          .from('agent_connections')
          .delete()
          .eq('id', connectionId)
          
        throw new Error(response.error || "Falha ao criar instância")
      }
      
      toast.success("Instância criada com sucesso")
      onOpenChange(false)
      onSuccess()
      
      // Redirect to QR code page if necessary
      if (response.status === 'awaiting_scan' && (response.qr || response.qrcode)) {
        window.location.href = `/connect-whatsapp/qr?connection_id=${connectionId}`
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
      <DialogContent className="sm:max-w-md">
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
