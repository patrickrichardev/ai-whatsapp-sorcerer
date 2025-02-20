
import { Card } from "@/components/ui/card"
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

  if (agents.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Nenhum Agente Encontrado</h1>
          <p className="text-muted-foreground">
            Você precisa criar um agente antes de conectá-lo a uma plataforma.
          </p>
          <button
            onClick={() => navigate("/create-assistant")}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Criar Agente
          </button>
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
            Escolha um agente para conectar a uma plataforma
          </p>
        </div>

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
                  Criado em: {new Date(agent.created_at).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
