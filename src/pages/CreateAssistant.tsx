
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot, Loader2, MessageSquare, Settings, Sparkles } from "lucide-react"

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

const CreateAssistant = () => {
  const [temperature, setTemperature] = useState([0.7])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(AGENT_TEMPLATES.custom)

  const handleTemplateChange = (value: string) => {
    const template = AGENT_TEMPLATES[value as keyof typeof AGENT_TEMPLATES]
    setFormData(template)
    setTemperature([template.temperature])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const toastId = toast.loading("Criando seu agente...")

      const { data, error } = await supabase.functions.invoke('create-agent', {
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
      navigate('/select-agent')
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || "Erro ao criar agente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4 animate-fadeIn">
      <div className="space-y-2 text-center mb-8">
        <h1 className="text-4xl font-bold">Criar Agente</h1>
        <p className="text-muted-foreground">
          Configure seu agente de IA personalizado
        </p>
      </div>
      
      <Card className="p-6 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                Criando...
              </>
            ) : (
              "Criar Agente"
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default CreateAssistant
