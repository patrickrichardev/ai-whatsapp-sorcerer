
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import ChatLayout from "@/components/chat/ChatLayout"
import { useConnectedDevices } from "@/hooks/useConnectedDevices"
import { Button } from "@/components/ui/button"
import { Smartphone } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function LiveChat() {
  const { user } = useAuth()
  const { connectedDevices, isLoading } = useConnectedDevices(user?.id)
  const [hasActiveDevice, setHasActiveDevice] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Verifica se há pelo menos um dispositivo ativo
    if (!isLoading) {
      const activeDevice = connectedDevices.find(device => device.is_active)
      setHasActiveDevice(!!activeDevice)
      
      if (!activeDevice && connectedDevices.length === 0) {
        toast.info("Você precisa conectar um dispositivo WhatsApp para usar o chat ao vivo", {
          duration: 6000,
          id: "no-device-warning"
        })
      }
    }
  }, [connectedDevices, isLoading])

  const handleConnectDevice = () => {
    navigate("/devices")
  }

  return (
    <div className="h-screen">
      {!hasActiveDevice && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-full px-4">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <Smartphone className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Nenhum Dispositivo Ativo</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Para usar o chat ao vivo, você precisa conectar pelo menos um dispositivo WhatsApp.
          </p>
          <Button onClick={handleConnectDevice} size="lg">
            Conectar WhatsApp
          </Button>
        </div>
      ) : (
        <ChatLayout />
      )}
    </div>
  )
}
