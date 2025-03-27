
import { Card } from "@/components/ui/card"
import { Smartphone } from "lucide-react"

export function EmptyDeviceState() {
  return (
    <Card className="p-6">
      <div className="text-center py-6">
        <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">Nenhuma instância conectada</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Você ainda não possui instâncias do WhatsApp conectadas.
        </p>
      </div>
    </Card>
  )
}
