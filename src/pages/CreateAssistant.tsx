
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AgentForm } from "@/components/agents/AgentForm"
import { AgentCard } from "@/components/agents/AgentCard"
import { EmptyState } from "@/components/agents/EmptyState"
import { AGENT_TEMPLATES } from "@/lib/constants/agents"

interface Agent {
  id: string
  name: string
  description: string | null
  prompt: string
  temperature: number
  created_at: string
}

interface FormData {
  name: string
  description: string
  prompt: string
  temperature: number
}

const CreateAssistant = () => {
  const [temperature, setTemperature] = useState([0.7])
  const [isLoading, setIsLoading] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const { user } = useAuth()
  const [formData, setFormData] = useState<FormData>(AGENT_TEMPLATES.custom)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<string | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [user])

  const fetchAgents = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from("agents")
        .select("id, name, description, prompt, temperature, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setAgents(data || [])
    } catch (error) {
      console.error("Error fetching agents:", error)
      toast.error("Erro ao carregar agentes")
    }
  }

  const handleEditAgent = (agent: Agent) => {
    setFormData({
      name: agent.name,
      description: agent.description || "",
      prompt: agent.prompt,
      temperature: agent.temperature,
    })
    setTemperature([agent.temperature])
    setEditingAgent(agent.id)
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData(AGENT_TEMPLATES.custom)
    setTemperature([0.7])
    setEditingAgent(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const toastId = toast.loading(editingAgent ? "Atualizando agente..." : "Criando seu agente...")

      if (editingAgent) {
        const { error } = await supabase
          .from('agents')
          .update({
            name: formData.name,
            description: formData.description,
            prompt: formData.prompt,
            temperature: temperature[0],
          })
          .eq('id', editingAgent)

        if (error) throw error

        toast.success("Agente atualizado com sucesso!", { id: toastId })
      } else {
        const { error } = await supabase.functions.invoke('create-agent', {
          body: {
            name: formData.name,
            description: formData.description,
            prompt: formData.prompt,
            temperature: temperature[0],
            user_id: user?.id
          }
        })

        if (error) throw error

        toast.success("Agente criado com sucesso!", { id: toastId })
      }

      setIsDialogOpen(false)
      fetchAgents()
      resetForm()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || "Erro ao salvar agente")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from("agents")
        .delete()
        .eq("id", agentId)

      if (error) throw error

      toast.success("Agente excluído com sucesso!")
      fetchAgents()
    } catch (error) {
      console.error("Error deleting agent:", error)
      toast.error("Erro ao excluir agente")
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Meus Agentes</h1>
          <p className="text-muted-foreground">
            Gerencie seus agentes de IA
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Agente
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>{editingAgent ? "Editar Agente" : "Criar Novo Agente"}</DialogTitle>
            </DialogHeader>
            <div className="p-6 overflow-y-auto">
              <AgentForm
                formData={formData}
                temperature={temperature}
                isLoading={isLoading}
                editingAgent={editingAgent}
                onSubmit={handleSubmit}
                setFormData={setFormData}
                setTemperature={setTemperature}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onEdit={() => handleEditAgent(agent)}
            onDelete={() => handleDeleteAgent(agent.id)}
          />
        ))}

        {agents.length === 0 && <EmptyState />}
      </div>
    </div>
  )
}

export default CreateAssistant
