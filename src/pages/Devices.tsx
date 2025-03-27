import { Card } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { 
  Smartphone, 
  Plus, 
  MessageSquare, 
  AlertTriangle,
  Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { useAgents } from "@/hooks/useAgents"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { initializeWhatsAppInstance, checkWhatsAppStatus } from "@/lib/evolution-api/instance"
import { supabase } from "@/lib/supabase"

const Devices = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreatingInstance, setIsCreatingInstance] = useState(false)
  const [instanceName, setInstanceName] = useState("")
  const [connectedDevices, setConnectedDevices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { agents } = useAgents(user?.id)

  useEffect(() => {
    if (user?.id) {
      fetchConnectedDevices()
    }
  }, [user?.id])

  const fetchConnectedDevices = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('agent_connections')
        .select('*')
        .eq('platform', 'whatsapp')
      
      if (error) throw error
      setConnectedDevices(data || [])
    } catch (error) {
      console.error("Erro ao buscar dispositivos:", error)
      toast.error("Não foi possível carregar os dispositivos conectados")
    } finally {
      setIsLoading(false)
    }
  }

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
          user_id: user?.id,
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
      setIsDialogOpen(false)
      fetchConnectedDevices()
      
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
    <div className="container max-w-4xl mx-auto py-8 px-4 animate-fadeIn">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Instâncias</h1>
          <p className="text-muted-foreground">
            Gerencie suas instâncias do WhatsApp e adicione novas
          </p>
        </div>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Criar Nova Instância</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione uma nova instância do WhatsApp para seus atendimentos
                </p>
              </div>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              Criar Instância
            </Button>
          </div>
        </Card>

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Instâncias Conectadas</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : connectedDevices.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {connectedDevices.map((device) => (
                <Card key={device.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${device.is_active ? 'bg-green-100' : 'bg-amber-100'}`}>
                        <Smartphone className={`h-5 w-5 ${device.is_active ? 'text-green-600' : 'text-amber-600'}`} />
                      </div>
                      <div>
                        <h3 className="font-medium">Instância {device.agent_id.substring(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Status: {device.is_active ? 'Conectado' : 'Desconectado'}
                        </p>
                      </div>
                    </div>
                    <Link to={`/connect-whatsapp/qr?agent=${device.agent_id}`}>
                      <Button variant="outline" size="sm">
                        Gerenciar
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6">
              <div className="text-center py-6">
                <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Nenhuma instância conectada</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Você ainda não possui instâncias do WhatsApp conectadas.
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Modal/Dialog para criar instância */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
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
      </div>
    </div>
  )
}

export default Devices
