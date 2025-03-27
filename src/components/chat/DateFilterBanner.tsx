
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface DateFilterBannerProps {
  selectedDate: Date | null
  handleClearDate: () => void
}

export default function DateFilterBanner({ 
  selectedDate, 
  handleClearDate 
}: DateFilterBannerProps) {
  if (!selectedDate) return null
  
  return (
    <div className="px-4 py-2 border-b bg-muted/30">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          onClick={handleClearDate}
        >
          Limpar
        </Button>
      </div>
    </div>
  )
}
