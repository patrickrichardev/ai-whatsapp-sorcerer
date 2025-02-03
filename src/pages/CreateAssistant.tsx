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

const CreateAssistant = () => {
  const [temperature, setTemperature] = useState([0.7])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get('name') as string
      const description = formData.get('description') as string
      const prompt = formData.get('prompt') as string

      const { data, error } = await supabase.functions.invoke('create-agent', {
        body: {
          name,
          description,
          prompt,
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
            <Label htmlFor="name">Nome do Agente</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Ex: Amanda" 
              required 
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