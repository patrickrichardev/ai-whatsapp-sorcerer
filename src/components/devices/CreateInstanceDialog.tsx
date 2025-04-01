
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
import { supabase } from "@/lib/supabase"
import { useAgents } from "@/hooks/useAgents"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNavigate } from "react-router-dom"

interface CreateInstanceDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  userId: string | undefined
  onSuccess: () => void
}

export function CreateInstanceDialog({ isOpen, onOpenChange, userId, onSuccess }: CreateInstanceDialogProps) {
  const [isCreatingInstance, setIsCreatingInstance] = useState(false)
  const [instanceName, setInstanceName] = useState("")
  const [selectedAgentId, setSelectedAgentId] = useState<string | "auto" | "none">("auto")
  const [phone, setPhone] = useState("")
  const { agents } = useAgents(userId)
  const navigate = useNavigate()

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
      console.log("Creating instance with name:", instanceName);
      
      // Create a WhatsApp connection record directly with a unique ID
      const connectionId = crypto.randomUUID()
      
      // Create the connection record
      const { error: connectionError } = await supabase
        .from('agent_connections')
        .insert({
          id: connectionId,
          platform: 'whatsapp',
          is_active: false,
          agent_id: selectedAgentId !== "auto" && selectedAgentId !== "none" ? selectedAgentId : null,
          connection_data: { 
            name: instanceName,
            status: 'creating',
            phone: phone || undefined,
            use_default_agent: selectedAgentId === "auto" 
          }
        })
      
      if (connectionError) {
        console.error("Error creating connection:", connectionError);
        throw connectionError;
      }
      
      console.log("Connection created with ID:", connectionId);
      
      // Se selecionou "auto" e não há agentes disponíveis, cria um agente temporário
      if (selectedAgentId === "auto" && agents.length === 0) {
        // Criar um agente temporário com nome padrão
        const { data: newAgent, error: agentError } = await supabase
          .from('agents')
          .insert({
            user_id: userId,
            name: `Agente automático (${instanceName})`,
            prompt: "Você é um assistente útil e amigável.",
            temperature: 0.7
          })
          .select('id')
          .single()
        
        if (agentError) {
          console.error("Error creating agent:", agentError);
          throw agentError;
        }
        
        // Atualizar a conexão com o ID do novo agente
        if (newAgent) {
          await supabase
            .from('agent_connections')
            .update({ agent_id: newAgent.id })
            .eq('id', connectionId)
          
          console.log("Updated connection with agent ID:", newAgent.id);
        }
      }
      
      toast.success("Instância criada com sucesso! Redirecionando para configuração...")
      onOpenChange(false)
      
      // Call onSuccess to refresh the devices list
      onSuccess()
      
      // Imediatamente redirecionar para a página do QR code
      console.log("Redirecting to WhatsApp QR page with connection ID:", connectionId);
      navigate(`/whatsapp-qr?connection_id=${connectionId}`)
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
          
          <div className="space-y-2">
            <Label htmlFor="phone-number">Número de Telefone (opcional)</Label>
            <Input 
              id="phone-number" 
              placeholder="Ex: 5511999990000 (com código do país)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Inclua o código do país (Ex: 55 para Brasil) sem símbolos ou espaços
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agent-selection">Associar a um Agente</Label>
            <Select 
              value={selectedAgentId} 
              onValueChange={(value) => setSelectedAgentId(value)}
            >
              <SelectTrigger id="agent-selection">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  Usar agente padrão ou criar automaticamente
                </SelectItem>
                <SelectItem value="none">
                  Sem agente (configurar depois)
                </SelectItem>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {selectedAgentId === "auto" 
                ? "Um agente será associado automaticamente ou criado se necessário"
                : selectedAgentId === "none" 
                  ? "Você poderá associar a um agente posteriormente"
                  : "A instância será conectada ao agente selecionado"}
            </p>
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
