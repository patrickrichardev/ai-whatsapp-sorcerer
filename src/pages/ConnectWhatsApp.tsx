import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Instagram, Lock, MessageSquare, Globe } from "lucide-react"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const ConnectWhatsApp = () => {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase
          .from("agents")
          .select("id, name")
        
        if (error) throw error
        
        setAgents(data || [])
      } catch (error) {
        console.error("Error fetching agents:", error)
        toast.error("Erro ao carregar agentes")
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  const handleLockedPlatform = () => {
    toast.info("Esta plataforma estará disponível em breve!")
  }

  const handleWhatsAppConnect = async () => {
    if (agents.length === 0) {
      toast.error("Você precisa criar um agente primeiro!")
      navigate("/create-assistant")
      return
    }

    // Se houver apenas um agente, use-o diretamente
    if (agents.length === 1) {
      navigate(`/connect-whatsapp/qr?agent_id=${agents[0].id}`)
      return
    }

    // Se houver múltiplos agentes, mostre um toast informativo
    // Em uma implementação futura, poderíamos adicionar um modal de seleção
    toast.error("Por favor, selecione um agente para conectar")
  }

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Conectar Agente</h1>
      <p className="text-muted-foreground mb-8">
        Selecione a plataforma que você deseja conectar seu agente
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* WhatsApp Card */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold">WhatsApp</h3>
            <p className="text-sm text-muted-foreground text-center">
              Conecte seu agente ao WhatsApp
            </p>
            <Button 
              className="w-full mt-4"
              onClick={handleWhatsAppConnect}
              disabled={loading}
            >
              Conectar
            </Button>
          </div>
        </Card>

        {/* Instagram Card */}
        <Card className="p-6 relative">
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center">
              <Instagram className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold">Instagram</h3>
            <p className="text-sm text-muted-foreground text-center">
              Conecte seu agente ao Instagram
            </p>
            <Button 
              className="w-full mt-4"
              variant="outline"
              onClick={handleLockedPlatform}
            >
              Em breve
            </Button>
          </div>
        </Card>

        {/* Site Card */}
        <Card className="p-6 relative">
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Globe className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold">Site</h3>
            <p className="text-sm text-muted-foreground text-center">
              Conecte seu agente ao seu site
            </p>
            <Button 
              className="w-full mt-4"
              variant="outline"
              onClick={handleLockedPlatform}
            >
              Em breve
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ConnectWhatsApp