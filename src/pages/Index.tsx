
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Bot, Star } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function Index() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  useEffect(() => {
    // Se o usuário já estiver autenticado, redireciona para o assistente
    if (user) {
      navigate("/content-assistant")
    }
  }, [user, navigate])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Assistentes IA Especializados</h1>
          <p className="text-xl text-muted-foreground">
            Potencialize sua produtividade com assistentes de IA treinados em áreas específicas
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-primary/50">
            <CardHeader className="pb-2">
              <MessageSquare className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Criação de Conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Crie textos persuasivos, posts para redes sociais, emails e mais
              </p>
              <Button 
                className="w-full"
                onClick={() => navigate("/content-assistant")}
              >
                Começar agora
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Bot className="h-8 w-8 text-muted-foreground mb-2" />
              <CardTitle>Marketing Digital</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Estratégias de marketing, análise de campanhas e otimização
              </p>
              <Button 
                className="w-full"
                variant="secondary"
                disabled
              >
                Em breve
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Star className="h-8 w-8 text-muted-foreground mb-2" />
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Otimização para mecanismos de busca e palavras-chave
              </p>
              <Button 
                className="w-full"
                variant="secondary"
                disabled
              >
                Em breve
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Faça login ou registre-se para acessar todos os nossos assistentes
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate("/login")}>
              Fazer Login
            </Button>
            <Button variant="outline" onClick={() => navigate("/login")}>
              Registrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
