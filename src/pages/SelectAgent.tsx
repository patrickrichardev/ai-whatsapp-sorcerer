import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Bot } from "lucide-react"

interface Agent {
  id: string
  name: string
  description: string | null
}

const SelectAgent = () => {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase
          .from("agents")
          .select("id, name, description")
        
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
      <div className="animate-fadeIn">
        <h1 className="text-4xl font-bold mb-8">Selecionar Agente</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div className="animate-fadeIn">
        <h1 className="text-4xl font-bold mb-8">Selecionar Agente</h1>
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Você ainda não tem nenhum agente criado.
          </p>
          <Button onClick={() => navigate("/create-assistant")}>
            Criar Agente
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8">Selecionar Agente</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card 
            key={agent.id} 
            className="p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => handleSelectAgent(agent.id)}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{agent.name}</h3>
              {agent.description && (
                <p className="text-sm text-muted-foreground text-center">
                  {agent.description}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default SelectAgent