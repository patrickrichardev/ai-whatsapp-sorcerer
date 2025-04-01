
import { useState } from "react"
import { Loader2, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { CreateDeviceCard } from "@/components/devices/CreateDeviceCard"
import { DeviceCard } from "@/components/devices/DeviceCard"
import { EmptyDeviceState } from "@/components/devices/EmptyDeviceState"
import { CreateInstanceDialog } from "@/components/devices/CreateInstanceDialog"
import { APISelectionDialog } from "@/components/devices/APISelectionDialog"
import { useConnectedDevices } from "@/hooks/useConnectedDevices"
import { Button } from "@/components/ui/button"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const Devices = () => {
  const [isAPISelectionOpen, setIsAPISelectionOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isRemovingDefaults, setIsRemovingDefaults] = useState(false)
  const { user } = useAuth()
  const { 
    connectedDevices, 
    isLoading, 
    fetchConnectedDevices, 
    deleteDevice, 
    deleteDefaultDevices 
  } = useConnectedDevices(user?.id)

  const handleCreateDeviceClick = () => {
    setIsAPISelectionOpen(true)
  }

  const handleSelectNonOfficial = () => {
    setIsAPISelectionOpen(false)
    setIsCreateDialogOpen(true)
  }

  const handleRemoveDefaultDevices = async () => {
    setIsRemovingDefaults(true)
    try {
      await deleteDefaultDevices()
    } finally {
      setIsRemovingDefaults(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 animate-fadeIn">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Instâncias</h1>
            <p className="text-muted-foreground">
              Gerencie suas instâncias do WhatsApp e adicione novas
            </p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800 hover:bg-red-50">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Remover instâncias padrão
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover instâncias padrão</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação removerá todas as instâncias com o nome "as" do sistema.
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isRemovingDefaults}>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={(e) => {
                    e.preventDefault()
                    handleRemoveDefaultDevices()
                  }}
                  disabled={isRemovingDefaults}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isRemovingDefaults ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Removendo...
                    </>
                  ) : 'Remover todas'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <CreateDeviceCard onClick={handleCreateDeviceClick} />

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Instâncias Conectadas</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : connectedDevices.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {connectedDevices.map((device) => (
                <DeviceCard 
                  key={device.id} 
                  device={device} 
                  onDelete={deleteDevice}
                />
              ))}
            </div>
          ) : (
            <EmptyDeviceState />
          )}
        </div>

        {/* API Selection Dialog */}
        <APISelectionDialog 
          isOpen={isAPISelectionOpen} 
          onOpenChange={setIsAPISelectionOpen}
          onSelectNonOfficial={handleSelectNonOfficial}
        />

        {/* Create Instance Dialog */}
        <CreateInstanceDialog 
          isOpen={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen} 
          userId={user?.id} 
          onSuccess={fetchConnectedDevices}
        />
      </div>
    </div>
  )
}

export default Devices
