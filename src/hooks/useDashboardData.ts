
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export interface DashboardStats {
  activeAgents: number
  attendedChats: number
  pendingChats: number
}

export interface HistoryData {
  date: string
  chats: number
}

export interface Agent {
  id: string
  name: string
}

export function useDashboardData(userId: string | undefined, selectedDate: Date, selectedAgent: string) {
  const [stats, setStats] = useState<DashboardStats>({
    activeAgents: 0,
    attendedChats: 0,
    pendingChats: 0
  })
  const [historyData, setHistoryData] = useState<HistoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!userId) return

        const { data: agents, error: agentsError } = await supabase
          .from('agents')
          .select('id')
          .eq('user_id', userId)

        if (agentsError) throw agentsError

        const agentIds = selectedAgent === "all" 
          ? agents?.map(agent => agent.id) 
          : [selectedAgent]

        const { data: chats, error: chatsError } = await supabase
          .from('chat_conversations')
          .select('status, created_at')
          .in('agent_id', agentIds || [])

        if (chatsError) throw chatsError

        const attended = chats?.filter(chat => chat.status === 'completed').length || 0
        const pending = chats?.filter(chat => chat.status === 'pending').length || 0

        setStats({
          activeAgents: agents?.length || 0,
          attendedChats: attended,
          pendingChats: pending
        })

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
  }, [userId, selectedDate, selectedAgent])

  return { stats, historyData, loading }
}
