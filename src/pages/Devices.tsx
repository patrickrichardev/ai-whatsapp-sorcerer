
import { Card } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { 
  Smartphone, 
  Plus, 
  MessageSquare, 
  AlertTriangle 
} from "lucide-react"
import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { useAgents } from "@/hooks/useAgents"

const Devices = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { user } = useAuth()
  const { agents } = useAgents(user?.id)

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 animate-fadeIn">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Dispositivos</h1>
          <p className="text-muted-foreground">
            Gerencie seus dispositivos conectados e adicione novos
          </p>
        </div>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Conectar Dispositivo</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione um novo dispositivo para usar com seus agentes
                </p>
              </div>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              Conectar
            </Button>
          </div>
        </Card>

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Dispositivos Conectados</h2>
          <Card className="p-6">
            <div className="text-center py-6">
              <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nenhum dispositivo conectado</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Você ainda não possui dispositivos conectados.
              </p>
            </div>
          </Card>
        </div>

        {/* Modal/Dialog para escolher o tipo de API */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Selecione o tipo de API</DialogTitle>
              <DialogDescription>
                Escolha o método de conexão para seu dispositivo
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <Link 
                to={agents.length > 0 ? `/select-agent` : "#"} 
                className={agents.length === 0 ? "pointer-events-none opacity-50" : ""}
                onClick={() => setIsDialogOpen(false)}
              >
                <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        API não oficial
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Conecte via QR Code com o WhatsApp do seu celular
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Card className="p-6 opacity-50 cursor-not-allowed">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">API oficial</h3>
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        Em breve
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Conecte usando a API oficial do WhatsApp Business
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {agents.length === 0 && (
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <div className="flex space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-medium">É necessário criar um agente primeiro</p>
                    <p className="mt-1">Você precisa criar pelo menos um agente antes de conectar um dispositivo.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setIsDialogOpen(false)
                        window.location.href = "/create-assistant"
                      }}
                    >
                      Criar Agente
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default Devices
