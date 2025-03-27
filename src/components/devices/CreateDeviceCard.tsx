
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface CreateDeviceCardProps {
  onClick: () => void
}

export function CreateDeviceCard({ onClick }: CreateDeviceCardProps) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Criar Nova Instância</h3>
            <p className="text-sm text-muted-foreground">
              Adicione uma nova instância do WhatsApp para seus atendimentos
            </p>
          </div>
        </div>
        <Button onClick={onClick}>
          Criar Instância
        </Button>
      </div>
    </Card>
  )
}
