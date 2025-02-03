import { Card } from "@/components/ui/card";
import { Bot, MessageSquare, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  const { data: agents, isLoading, error } = useQuery({
    queryKey: ["agents", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar agentes:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user, // Só executa a query quando houver um usuário autenticado
  });

  if (error) {
    console.error("Erro na query:", error);
    return (
      <div className="animate-fadeIn">
        <h1 className="text-4xl font-bold mb-8">Painel de Controle</h1>
        <div className="text-center text-red-500">
          Erro ao carregar dados. Por favor, tente novamente.
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8">Painel de Controle</h1>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Agentes</p>
              <h3 className="text-2xl font-bold">{agents?.length || 0}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Mensagens</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Usuários</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            Carregando...
          </div>
        ) : agents && agents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Agente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data de Criação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell>{agent.description || "Sem descrição"}</TableCell>
                  <TableCell>
                    {format(new Date(agent.created_at), "dd 'de' MMMM 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Nenhuma atividade recente
          </div>
        )}
      </Card>
    </div>
  );
};

export default Index;