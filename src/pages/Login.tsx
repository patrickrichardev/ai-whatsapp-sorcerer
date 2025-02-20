
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { Navigate } from "react-router-dom"
import { toast } from "sonner"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { signIn, user, loading } = useAuth()
  
  // Redireciona para página principal se já estiver logado
  if (user) {
    return <Navigate to="/create-assistant" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos")
      return
    }

    try {
      await signIn(email, password)
    } catch (error) {
      console.error("Login error:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-6 space-y-6 glass-card">
        <div className="space-y-2 text-center">
          <img src="/elia.png" alt="Logo" className="h-12 mx-auto" />
          <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
          <p className="text-sm text-muted-foreground">
            Entre para gerenciar seus assistentes de IA
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Ainda não tem uma conta?
          </p>
          <Button variant="link" onClick={() => toast.info("Em breve!")}>
            Criar conta
          </Button>
        </div>
      </Card>
    </div>
  )
}
