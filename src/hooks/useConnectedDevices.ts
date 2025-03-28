
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export interface ConnectedDevice {
  id: string
  agent_id: string
  is_active: boolean
  platform: string
}

export function useConnectedDevices(userId: string | undefined) {
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchConnectedDevices = async () => {
    if (!userId) return
    
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('agent_connections')
        .select('*')
        .eq('platform', 'whatsapp')
        .eq('is_active', true) // Apenas dispositivos realmente ativos
      
      if (error) throw error
      setConnectedDevices(data || [])
    } catch (error) {
      console.error("Erro ao buscar dispositivos:", error)
      toast.error("Não foi possível carregar os dispositivos conectados")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchConnectedDevices()
    }
  }, [userId])

  return {
    connectedDevices,
    isLoading,
    fetchConnectedDevices
  }
}
