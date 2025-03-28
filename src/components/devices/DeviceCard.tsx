
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone } from "lucide-react"
import { Link } from "react-router-dom"

interface DeviceCardProps {
  device: {
    id: string
    agent_id: string
    is_active: boolean
    connection_data?: {
      name?: string
      status?: string
    }
  }
}

export function DeviceCard({ device }: DeviceCardProps) {
  // Get instance name from connection_data or use a fallback
  const instanceName = device.connection_data?.name || `Instância ${device.agent_id.substring(0, 8)}`

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${device.is_active ? 'bg-green-100' : 'bg-amber-100'}`}>
            <Smartphone className={`h-5 w-5 ${device.is_active ? 'text-green-600' : 'text-amber-600'}`} />
          </div>
          <div>
            <h3 className="font-medium">{instanceName}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Status: {device.is_active ? 'Conectado' : 'Desconectado'}
            </p>
          </div>
        </div>
        <Link to={`/connect-whatsapp/qr?agent_id=${device.agent_id}`}>
          <Button variant="outline" size="sm">
            Gerenciar
          </Button>
        </Link>
      </div>
    </Card>
  )
}
