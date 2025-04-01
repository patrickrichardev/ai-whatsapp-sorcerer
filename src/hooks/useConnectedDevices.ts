
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
      
      // Filtrar para mostrar apenas instâncias válidas e remover a instância padrão "as"
      const validDevices = data?.filter(device => 
        device.connection_data && 
        device.connection_data.name &&
        device.connection_data.name !== "as" // Remover a instância com nome "as"
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

  // Método para remover todas as instâncias com nome "as"
  const deleteDefaultDevices = async () => {
    try {
      const { error } = await supabase
        .from('agent_connections')
        .delete()
        .eq('platform', 'whatsapp')
        .filter('connection_data->name', 'eq', 'as')
        
      if (error) throw error
      
      toast.success("Instâncias padrão removidas com sucesso")
      fetchConnectedDevices() // Atualizar a lista após excluir
    } catch (error) {
      console.error("Erro ao excluir instâncias padrão:", error)
      toast.error("Não foi possível remover as instâncias padrão")
    }
  }

  return {
    connectedDevices,
    isLoading,
    fetchConnectedDevices,
    deleteDevice,
    deleteDefaultDevices
  }
}
