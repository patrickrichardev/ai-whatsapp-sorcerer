
import { Card } from "@/components/ui/card"
import { Bot } from "lucide-react"

export function EmptyState() {
  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <Bot className="w-12 h-12 text-muted-foreground mx-auto" />
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Nenhum agente encontrado</h3>
          <p className="text-sm text-muted-foreground">
            Você ainda não criou nenhum agente. Crie seu primeiro agente clicando no botão acima.
          </p>
        </div>
      </div>
    </Card>
  )
}
