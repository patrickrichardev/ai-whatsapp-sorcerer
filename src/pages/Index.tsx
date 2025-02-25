
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, History, MessageSquare, MessageSquarePlus } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { ChartFilters } from "@/components/dashboard/ChartFilters"
import { HistoryChart } from "@/components/dashboard/HistoryChart"
import { useDashboardData } from "@/hooks/useDashboardData"
import { useAgents } from "@/hooks/useAgents"

export default function Index() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedAgent, setSelectedAgent] = useState<string>("all")
  const { user } = useAuth()
  const { agents } = useAgents(user?.id)
  const { stats, historyData, loading } = useDashboardData(user?.id, selectedDate, selectedAgent)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 w-1/3 bg-muted rounded" />
                <div className="h-8 w-1/2 bg-muted rounded" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-4 w-1/4 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Agentes Ativos"
          value={stats.activeAgents}
          description="Total de agentes configurados"
          icon={Activity}
        />
        <StatsCard
          title="Atendimentos Realizados"
          value={stats.attendedChats}
          description="Conversas finalizadas"
          icon={MessageSquare}
        />
        <StatsCard
          title="Atendimentos Pendentes"
          value={stats.pendingChats}
          description="Aguardando atendimento"
          icon={MessageSquarePlus}
        />
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Histórico de Atendimentos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Quantidade de atendimentos nos últimos 7 dias
              </p>
            </div>
            <History className="h-4 w-4 text-muted-foreground" />
          </div>
          <ChartFilters
            agents={agents}
            selectedAgent={selectedAgent}
            selectedDate={selectedDate}
            onAgentChange={setSelectedAgent}
            onDateChange={(date) => date && setSelectedDate(date)}
          />
        </CardHeader>
        <CardContent>
          <HistoryChart data={historyData} />
        </CardContent>
      </Card>
    </div>
  )
}
