
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Agent {
  id: string
  name: string
}

interface ChartFiltersProps {
  agents: Agent[]
  selectedAgent: string
  selectedDate: Date
  onAgentChange: (value: string) => void
  onDateChange: (date: Date | undefined) => void
}

export function ChartFilters({
  agents,
  selectedAgent,
  selectedDate,
  onAgentChange,
  onDateChange
}: ChartFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <Select
        value={selectedAgent}
        onValueChange={onAgentChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Selecionar agente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os agentes</SelectItem>
          {agents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              {agent.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[180px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateChange(date)}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
