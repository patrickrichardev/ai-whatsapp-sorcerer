
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { Bot, Loader2, MessageSquare, Settings, Sparkles, Plus, Trash2, Pencil } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const AGENT_TEMPLATES = {
  custom: {
    name: "",
    description: "",
    prompt: "",
    temperature: 0.7,
  },
  sales: {
    name: "Vendedor",
    description: "Agente especializado em vendas e conversão de leads",
    prompt: "Você é um vendedor profissional especializado em converter leads em clientes. Você deve ser amigável, persuasivo e focado em entender as necessidades do cliente para oferecer as melhores soluções. Mantenha um tom profissional mas acolhedor, e sempre busque identificar oportunidades de venda sem ser invasivo. Use técnicas de vendas consultivas e foque em construir relacionamentos duradouros com os clientes.",
    temperature: 0.8,
  },
  support: {
    name: "Suporte",
    description: "Agente especializado em atendimento ao cliente e suporte técnico",
    prompt: "Você é um agente de suporte técnico especializado em resolver problemas e auxiliar clientes. Seja sempre paciente, claro e empático nas suas respostas. Seu objetivo é ajudar os usuários a resolverem seus problemas da forma mais eficiente possível, mantendo um tom profissional e amigável. Forneça instruções passo a passo quando necessário e sempre confirme se o problema foi resolvido.",
    temperature: 0.6,
  },
}

interface Agent {
  id: string
  name: string
  description: string | null
  prompt: string
  temperature: number
  created_at: string
}

const CreateAssistant = () => {
  const [temperature, setTemperature] = useState([0.7])
  const [isLoading, setIsLoading] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const { user } = useAuth()
  const [formData, setFormData] = useState(AGENT_TEMPLATES.custom)
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

  const handleTemplateChange = (value: string) => {
    const template = AGENT_TEMPLATES[value as keyof typeof AGENT_TEMPLATES]
    setFormData(template)
    setTemperature([template.temperature])
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
              <Card className="p-6 space-y-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {!editingAgent && (
                    <div className="space-y-4">
                      <Label className="text-lg">Modelo de Agente</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card 
                          className={`p-4 cursor-pointer hover:shadow-md transition-all border-2 ${
                            Object.entries(formData).every(([key, value]) => 
                              AGENT_TEMPLATES.custom[key as keyof typeof AGENT_TEMPLATES.custom] === value
                            ) ? 'border-primary' : 'border-transparent'
                          }`}
                          onClick={() => handleTemplateChange('custom')}
                        >
                          <Settings className="w-8 h-8 mb-2 text-muted-foreground" />
                          <h3 className="font-semibold">Personalizado</h3>
                          <p className="text-sm text-muted-foreground">
                            Crie um agente do zero
                          </p>
                        </Card>

                        <Card 
                          className={`p-4 cursor-pointer hover:shadow-md transition-all border-2 ${
                            formData === AGENT_TEMPLATES.sales ? 'border-primary' : 'border-transparent'
                          }`}
                          onClick={() => handleTemplateChange('sales')}
                        >
                          <Sparkles className="w-8 h-8 mb-2 text-primary" />
                          <h3 className="font-semibold">Vendedor</h3>
                          <p className="text-sm text-muted-foreground">
                            Especialista em vendas
                          </p>
                        </Card>

                        <Card 
                          className={`p-4 cursor-pointer hover:shadow-md transition-all border-2 ${
                            formData === AGENT_TEMPLATES.support ? 'border-primary' : 'border-transparent'
                          }`}
                          onClick={() => handleTemplateChange('support')}
                        >
                          <MessageSquare className="w-8 h-8 mb-2 text-green-500" />
                          <h3 className="font-semibold">Suporte</h3>
                          <p className="text-sm text-muted-foreground">
                            Atendimento ao cliente
                          </p>
                        </Card>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Agente</Label>
                    <div className="relative">
                      <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        name="name" 
                        placeholder="Ex: Amanda" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea 
                      id="description" 
                      name="description"
                      placeholder="Descreva o que seu agente faz..."
                      className="resize-none"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Prompt do Agente</Label>
                    <Textarea 
                      id="prompt" 
                      name="prompt"
                      placeholder="Defina a personalidade do agente e coloque todas as informações..."
                      className="resize-none"
                      rows={5}
                      required
                      value={formData.prompt}
                      onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Temperatura</Label>
                      <span className="text-sm text-muted-foreground">{temperature}</span>
                    </div>
                    <Slider
                      value={temperature}
                      onValueChange={setTemperature}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Valores mais altos tornam a resposta do agente mais criativa, valores mais baixos a tornam mais focada.
                    </p>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingAgent ? "Atualizando..." : "Criando..."}
                      </>
                    ) : (
                      editingAgent ? "Atualizar Agente" : "Criar Agente"
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">{agent.name}</h3>
                {agent.description && (
                  <p className="text-sm text-muted-foreground mb-2">{agent.description}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Criado em {new Date(agent.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleEditAgent(agent)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Agente</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir este agente? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteAgent(agent.id)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        ))}

        {agents.length === 0 && (
          <Card className="p-6">
            <div className="text-center space-y-4">
              <Bot className="w-12 h-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Nenhum agente encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Você ainda não criou nenhum agente. Crie seu primeiro agente clicando no botão acima.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default CreateAssistant
