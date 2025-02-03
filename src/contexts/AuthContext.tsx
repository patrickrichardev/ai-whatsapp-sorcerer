import { createContext, useContext, useEffect, useState } from "react"
import { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

interface AuthContextType {
  session: Session | null
  user: User | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Primeiro, obtemos a sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session loaded:", session)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Depois, configuramos o listener para mudanças de estado
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session)
      setSession(session)
      setUser(session?.user ?? null)
      
      // Se o usuário fez login, redireciona para a página inicial
      if (session?.user && window.location.pathname === '/login') {
        navigate('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success("Login realizado com sucesso!")
    } catch (error) {
      console.error("Error signing in:", error)
      toast.error("Erro ao fazer login. Verifique suas credenciais.")
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      navigate("/login")
      toast.success("Logout realizado com sucesso!")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Erro ao fazer logout.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ session, user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}