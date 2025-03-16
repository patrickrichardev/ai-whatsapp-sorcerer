
import { Card } from "@/components/ui/card"
import { Bot } from "lucide-react"

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ 
  title = "Nenhum agente encontrado", 
  description = "Você ainda não criou nenhum agente. Crie seu primeiro agente clicando no botão acima.", 
  icon = <Bot className="w-12 h-12 text-muted-foreground mx-auto" />,
  action
}: EmptyStateProps) {
  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        {icon}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        {action}
      </div>
    </Card>
  )
}
