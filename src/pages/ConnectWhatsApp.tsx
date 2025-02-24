
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Instagram, Lock, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const ConnectWhatsApp = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const agentId = searchParams.get("agent_id")
  const [agentName, setAgentName] = useState<string>("")

  useEffect(() => {
    if (!agentId) {
      navigate("/select-agent")
      return
    }

    const fetchAgent = async () => {
      try {
        const { data, error } = await supabase
          .from("agents")
          .select("name")
          .eq("id", agentId)
          .single()
        
        if (error) throw error
        
        setAgentName(data.name)
      } catch (error) {
        console.error("Error fetching agent:", error)
        toast.error("Erro ao carregar informações do agente")
        navigate("/select-agent")
      }
    }

    fetchAgent()
  }, [agentId, navigate])

  const handleLockedPlatform = () => {
    toast.info("Esta plataforma estará disponível em breve!")
  }

  const handleWhatsAppConnect = () => {
    navigate(`/connect-whatsapp/qr?agent_id=${agentId}`)
  }

  if (!agentId) return null

  return (
    <div className="animate-fadeIn container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Conectar Agente</h1>
          <p className="text-muted-foreground">
            Agente selecionado: <span className="font-medium">{agentName}</span>
          </p>
          <p className="text-muted-foreground">
            Selecione a plataforma que você deseja conectar seu agente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* WhatsApp Comum Card */}
          <Card className="relative overflow-hidden">
            <div className="p-6 flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold">WhatsApp Comum</h3>
              <p className="text-sm text-muted-foreground text-center">
                Conecte seu agente ao WhatsApp via QR Code
              </p>
              <Button 
                className="w-full mt-auto"
                onClick={handleWhatsAppConnect}
              >
                Conectar
              </Button>
            </div>
          </Card>

          {/* WhatsApp API Oficial Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold">WhatsApp API</h3>
              <p className="text-sm text-muted-foreground text-center">
                API Oficial do WhatsApp Business
              </p>
              <Button 
                className="w-full mt-auto"
                variant="outline"
                onClick={handleLockedPlatform}
              >
                Em breve
              </Button>
            </div>
          </Card>

          {/* Instagram Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Instagram className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold">Instagram</h3>
              <p className="text-sm text-muted-foreground text-center">
                Conecte seu agente ao Instagram
              </p>
              <Button 
                className="w-full mt-auto"
                variant="outline"
                onClick={handleLockedPlatform}
              >
                Em breve
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ConnectWhatsApp
