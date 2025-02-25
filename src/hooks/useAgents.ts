
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Agent {
  id: string
  name: string
}

export function useAgents(userId: string | undefined) {
  const [agents, setAgents] = useState<Agent[]>([])

  useEffect(() => {
    const fetchAgents = async () => {
      if (!userId) return
      
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('id, name')
          .eq('user_id', userId)

        if (error) throw error
        setAgents(data)
      } catch (error) {
        console.error('Error fetching agents:', error)
        toast.error('Erro ao carregar agentes')
      }
    }

    fetchAgents()
  }, [userId])

  return { agents }
}
