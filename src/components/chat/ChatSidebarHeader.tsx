
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Calendar } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { ptBR } from "date-fns/locale"

interface ChatSidebarHeaderProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  selectedDate: Date | null
  handleDateSelect: (date: Date | undefined) => void
  handleClearDate: () => void
}

export default function ChatSidebarHeader({
  searchTerm,
  setSearchTerm,
  selectedDate,
  handleDateSelect,
  handleClearDate
}: ChatSidebarHeaderProps) {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-card-foreground">Conversas</h2>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant={selectedDate ? "default" : "ghost"} 
                size="icon" 
                className="h-8 w-8"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Filtrar por data</span>
                  {selectedDate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={handleClearDate}
                    >
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={ptBR}
                className="rounded-md border-0"
              />
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar conversa..." 
          className="pl-9 bg-background/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  )
}
