
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { MessageSquare } from "lucide-react"
import { toast } from "sonner"

interface Agent {
  id: string
  name: string
  created_at: string
}

const SelectAgent = () => {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        if (!user?.id) return

        const { data, error } = await supabase
          .from("agents")
          .select("id, name, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

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
  }, [user])

  const handleSelectAgent = (agentId: string) => {
    navigate(`/connect-whatsapp?agent_id=${agentId}`)
  }

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 w-1/4 bg-muted rounded mb-2" />
              <div className="h-4 w-1/3 bg-muted rounded" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Selecionar Agente</h1>
          <p className="text-muted-foreground">
            Escolha qual agente você deseja conectar a uma plataforma
          </p>
        </div>

        {agents.length === 0 ? (
          <Card className="p-6">
            <div className="text-center space-y-4">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Nenhum agente encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Você ainda não criou nenhum agente. Crie um agente primeiro para poder conectá-lo.
                </p>
              </div>
              <Button onClick={() => navigate("/create-assistant")}>
                Criar Agente
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Criado em {new Date(agent.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Button onClick={() => handleSelectAgent(agent.id)}>
                    Selecionar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SelectAgent
