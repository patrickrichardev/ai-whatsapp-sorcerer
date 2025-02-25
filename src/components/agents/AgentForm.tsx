
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Bot, Loader2, MessageSquare, Settings, Sparkles } from "lucide-react"
import { AGENT_TEMPLATES } from "@/lib/constants/agents"

interface AgentFormProps {
  formData: {
    name: string
    description: string
    prompt: string
    temperature: number
  }
  temperature: number[]
  isLoading: boolean
  editingAgent: string | null
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  setFormData: (data: any) => void
  setTemperature: (temp: number[]) => void
}

export function AgentForm({
  formData,
  temperature,
  isLoading,
  editingAgent,
  onSubmit,
  setFormData,
  setTemperature
}: AgentFormProps) {
  const handleTemplateChange = (value: string) => {
    const template = AGENT_TEMPLATES[value as keyof typeof AGENT_TEMPLATES]
    setFormData(template)
    setTemperature([template.temperature])
  }

  return (
    <Card className="p-6 space-y-8">
      <form onSubmit={onSubmit} className="space-y-6">
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
  )
}
