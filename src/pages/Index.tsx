
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, History, MessageSquare, MessageSquarePlus } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar as CalendarIcon } from "lucide-react"

interface DashboardStats {
  activeAgents: number
  attendedChats: number
  pendingChats: number
}

interface HistoryData {
  date: string
  chats: number
}

interface Agent {
  id: string
  name: string
}

const Index = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activeAgents: 0,
    attendedChats: 0,
    pendingChats: 0
  })
  const [historyData, setHistoryData] = useState<HistoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedAgent, setSelectedAgent] = useState<string>("all")
  const [agents, setAgents] = useState<Agent[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const fetchAgents = async () => {
      if (!user?.id) return
      
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('id, name')
          .eq('user_id', user.id)

        if (error) throw error
        setAgents(data)
      } catch (error) {
        console.error('Error fetching agents:', error)
        toast.error('Erro ao carregar agentes')
      }
    }

    fetchAgents()
  }, [user])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user?.id) return

        // Fetch active agents
        const { data: agents, error: agentsError } = await supabase
          .from('agents')
          .select('id')
          .eq('user_id', user.id)

        if (agentsError) throw agentsError

        // Prepare agent filter
        const agentIds = selectedAgent === "all" 
          ? agents?.map(agent => agent.id) 
          : [selectedAgent]

        // Fetch chats statistics
        const { data: chats, error: chatsError } = await supabase
          .from('chat_conversations')
          .select('status, created_at')
          .in('agent_id', agentIds || [])

        if (chatsError) throw chatsError

        // Calculate stats
        const attended = chats?.filter(chat => chat.status === 'completed').length || 0
        const pending = chats?.filter(chat => chat.status === 'pending').length || 0

        setStats({
          activeAgents: agents?.length || 0,
          attendedChats: attended,
          pendingChats: pending
        })

        // Calculate history data (last 7 days from selected date)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(selectedDate)
          date.setDate(date.getDate() - i)
          return date.toISOString().split('T')[0]
        }).reverse()

        const historyStats = last7Days.map(date => ({
          date: new Date(date).toLocaleDateString('pt-BR'),
          chats: chats?.filter(chat => 
            new Date(chat.created_at).toISOString().split('T')[0] === date
          ).length || 0
        }))

        setHistoryData(historyStats)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Erro ao carregar dados do dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, selectedDate, selectedAgent])

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agentes Ativos
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAgents}</div>
            <p className="text-xs text-muted-foreground">
              Total de agentes configurados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Atendimentos Realizados
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendedChats}</div>
            <p className="text-xs text-muted-foreground">
              Conversas finalizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Atendimentos Pendentes
            </CardTitle>
            <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingChats}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando atendimento
            </p>
          </CardContent>
        </Card>
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
          <div className="flex items-center gap-4">
            <Select
              value={selectedAgent}
              onValueChange={setSelectedAgent}
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
                  variant={"outline"}
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
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs text-muted-foreground"
                />
                <YAxis 
                  className="text-xs text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))'
                  }}
                  labelStyle={{
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="chats"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Index
