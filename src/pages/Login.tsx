
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { Navigate } from "react-router-dom"
import { toast } from "sonner"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, user, loading } = useAuth()
  
  if (user) {
    return <Navigate to="/select-agent" replace />
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <img 
            src="/elia.png" 
            alt="Logo" 
            className="h-16 mx-auto hover:scale-105 transition-transform" 
          />
          <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
          <p className="text-muted-foreground">
            Entre para gerenciar seus assistentes de IA
          </p>
        </div>

        <Card className="p-6 space-y-6 shadow-lg border-t-4 border-t-primary">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continue com
                </span>
              </div>
            </div>

            <div className="text-center">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => toast.info("Em breve!")}
              >
                Criar nova conta
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
