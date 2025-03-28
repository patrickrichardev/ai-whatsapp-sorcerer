
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export interface ConnectedDevice {
  id: string
  is_active: boolean
  platform: string
  connection_data?: {
    name?: string
    status?: string
  }
}

export function useConnectedDevices(userId: string | undefined) {
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchConnectedDevices = async () => {
    if (!userId) return
    
    setIsLoading(true)
    try {
      // Fetch WhatsApp connections
      const { data, error } = await supabase
        .from('agent_connections')
        .select('*')
        .eq('platform', 'whatsapp')
      
      if (error) throw error
      
      // Filtrar para mostrar apenas instâncias válidas
      const validDevices = data?.filter(device => 
        device.connection_data && 
        device.connection_data.name
      ) || [];
      
      setConnectedDevices(validDevices)
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

  // Método para excluir uma instância
  const deleteDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('agent_connections')
        .delete()
        .eq('id', deviceId)
        
      if (error) throw error
      
      toast.success("Instância removida com sucesso")
      fetchConnectedDevices() // Atualizar a lista após excluir
    } catch (error) {
      console.error("Erro ao excluir instância:", error)
      toast.error("Não foi possível remover a instância")
    }
  }

  return {
    connectedDevices,
    isLoading,
    fetchConnectedDevices,
    deleteDevice
  }
}
