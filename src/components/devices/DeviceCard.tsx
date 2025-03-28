
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeviceCardProps {
  device: {
    id: string
    agent_id: string
    is_active: boolean
    connection_data?: {
      name?: string
      status?: string
    }
    agents?: {
      name: string
    }
  }
  onDelete: (deviceId: string) => Promise<void>
}

export function DeviceCard({ device, onDelete }: DeviceCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Get instance name from agent or connection_data
  const instanceName = device.agents?.name || 
                       device.connection_data?.name || 
                       `Instância ${device.agent_id.substring(0, 8)}`

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(device.id)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

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
        <div className="flex space-x-2">
          <Link to={`/connect-whatsapp/qr?agent_id=${device.agent_id}`}>
            <Button variant="outline" size="sm">
              Gerenciar
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover instância</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a instância "{instanceName}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
