
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Agent {
  id: string
  name: string
  description: string
  created_at: string
}

export default function SelectAgent() {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase
          .from("agents")
          .select("*")
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
  }, [])

  const handleSelectAgent = (agentId: string) => {
    navigate(`/connect-whatsapp?agent_id=${agentId}`)
  }

  const handleCreateAgent = () => {
    navigate("/create-assistant")
  }

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-4 w-64 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Seus Agentes</h1>
            <p className="text-muted-foreground">
              Selecione um agente para conectar a uma plataforma
            </p>
          </div>
          <Button onClick={handleCreateAgent}>
            Criar Novo Agente
          </Button>
        </div>

        {agents.length === 0 ? (
          <div className="text-center space-y-4 py-12">
            <h2 className="text-xl font-semibold">Nenhum Agente Encontrado</h2>
            <p className="text-muted-foreground">
              Você ainda não possui nenhum agente. Crie seu primeiro agente para começar.
            </p>
            <Button onClick={handleCreateAgent}>
              Criar Primeiro Agente
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelectAgent(agent.id)}
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {agent.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Criado em: {new Date(agent.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
