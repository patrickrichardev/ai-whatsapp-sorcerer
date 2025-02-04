import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

      toast.success("Agente criado com sucesso!")
      navigate('/connect-whatsapp')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.message || "Erro ao criar agente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Criar Agente</h1>
      
      <Card className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Modelo de Agente</Label>
            <Select onValueChange={handleTemplateChange} defaultValue="custom">
              <SelectTrigger>
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Personalizado</SelectItem>
                <SelectItem value="sales">Vendedor</SelectItem>
                <SelectItem value="support">Suporte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome do Agente</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Ex: Amanda" 
              required 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
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
          
          <div className="space-y-2">
            <Label>Temperatura: {temperature}</Label>
            <Slider
              value={temperature}
              onValueChange={setTemperature}
              max={1}
              step={0.1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Valores mais altos tornam a resposta do agente mais aleatória, valores mais baixos a tornam mais focada.
            </p>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar Agente"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default CreateAssistant