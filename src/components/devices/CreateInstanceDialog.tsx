import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, QrCode } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAgents } from "@/hooks/useAgents";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QRCodeDisplay } from "@/components/whatsapp/QRCodeDisplay";
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";
import {
  ConnectionStatusType,
  initializeWhatsAppInstance,
} from "@/lib/evolution-api";
import { ConnectionStatus } from "../whatsapp/ConnectionStatus";

interface CreateInstanceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | undefined;
  onSuccess: () => void;
}

interface ConnectionState {
  success: boolean;
  qr: string;
  status: ConnectionStatusType;
  instanceCreated: boolean;
}

const initialState: ConnectionState = {
  success: false,
  qr: null,
  status: null,
  instanceCreated: false,
};

export function CreateInstanceDialog({
  isOpen,
  onOpenChange,
  userId,
  onSuccess,
}: CreateInstanceDialogProps) {
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);
  const [instanceName, setInstanceName] = useState("");

  const [selectedAgentId, setSelectedAgentId] = useState<
    string | "auto" | "none"
  >("auto");

  const [creationStep, setCreationStep] = useState<
    "form" | "connecting" | "qrcode"
  >("form");

  const { agents } = useAgents(userId);

  const { isRefreshing, attempts, errorMessage, checkStatus, handleRefresh } =
    useWhatsAppConnection(connectionId);

  const [state, setState] = useState<ConnectionState>(initialState);

  const updateState = (updates: Partial<ConnectionState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleCreateInstance = async () => {
    if (!instanceName) {
      toast.error("Por favor, forneça um nome para a instância");
      return;
    }

    if (!userId) {
      toast.error("Usuário não identificado");
      return;
    }

    setIsCreatingInstance(true);
    setCreationStep("connecting");

    try {
      // Create a WhatsApp connection record directly with a unique ID
      const connectionId = crypto.randomUUID();
      setConnectionId(connectionId);

      // Create the connection record
      const { error: connectionError } = await supabase
        .from("agent_connections")
        .insert({
          id: connectionId,
          platform: "whatsapp",
          is_active: false,
          agent_id:
            selectedAgentId !== "auto" && selectedAgentId !== "none"
              ? selectedAgentId
              : null,
          connection_data: {
            name: instanceName,
            status: "creating",
            use_default_agent: selectedAgentId === "auto",
          },
        });

      if (connectionError) throw connectionError;

      // Se selecionou "auto" e não há agentes disponíveis, cria um agente temporário
      if (selectedAgentId === "auto" && agents.length === 0) {
        // Criar um agente temporário com nome padrão
        const { data: newAgent, error: agentError } = await supabase
          .from("agents")
          .insert({
            user_id: userId,
            name: `Agente automático (${instanceName})`,
            prompt: "Você é um assistente útil e amigável.",
            temperature: 0.7,
          })
          .select("id")
          .single();

        if (agentError) throw agentError;

        // Atualizar a conexão com o ID do novo agente
        if (newAgent) {
          await supabase
            .from("agent_connections")
            .update({ agent_id: newAgent.id })
            .eq("id", connectionId);
        }
      }

      // Initialize the WhatsApp instance in Evolution API
      console.log("Inicializando instância com ID:", connectionId);
      const response = await initializeWhatsAppInstance(connectionId);
      console.log("Resposta da api pós inicilização:", response);

      if (!response.success && !response.partialSuccess) {
        // Clean up the record if the API call fails
        await supabase
          .from("agent_connections")
          .delete()
          .eq("id", connectionId);

        throw new Error(response.error || "Falha ao criar instância");
      }

      updateState({
        qr: response.qr,
        instanceCreated: response.instanceCreated,
        status: response.status,
        success: false,
      });

      toast.success("Instância criada com sucesso");

      // Move to QR code display step
      if (response.qr) {
        setCreationStep("qrcode");
        console.log("QR Code disponível, movendo para etapa de escaneamento");
      } else {
        console.log("QR Code não disponível, aguardando...");
        setCreationStep("qrcode"); // Mesmo sem QR code inicial, vamos para a tela de QR
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erro ao criar instância:", error);
      toast.error(`Erro ao criar instância: ${error.message}`);
      setCreationStep("form");
    } finally {
      setIsCreatingInstance(false);
    }
  };

  useEffect(() => {
    let intervalId: number | undefined;

    // Only set up interval when we're showing QR code and have a connection ID
    if (creationStep === "qrcode" && connectionId) {
      // Verificar status imediatamente após a mudança para a etapa de QR code
      checkStatus();

      intervalId = window.setInterval(async () => {
        console.log("Verificando status da conexão...");
        const isConnected = await checkStatus();
        if (isConnected) {
          toast.success("WhatsApp conectado com sucesso!");
          setTimeout(() => {
            onOpenChange(false);
            onSuccess();
          }, 5000);
        }
      }, 5000);
    }

    // Return cleanup function
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [creationStep, connectionId, checkStatus, onOpenChange, onSuccess]);

  // Debug log para acompanhar o QR code
  // useEffect(() => {
  //   if (qrCode) {
  //     console.log("QR Code atualizado:", qrCode.substring(0, 30) + "...");
  //   }
  // }, [qrCode]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Only allow closing if we're in form step or if instance is connected
        if (
          !open &&
          (creationStep === "form" || state.status === "connected")
        ) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        {creationStep === "form" && (
          <>
            <DialogHeader>
              <DialogTitle>Criar Nova Instância</DialogTitle>
              <DialogDescription>
                Forneça um nome para sua nova instância do WhatsApp
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="instance-name">Nome da Instância</Label>
                <Input
                  id="instance-name"
                  placeholder="Ex: Suporte, Vendas, etc."
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-selection">Associar a um Agente</Label>
                <Select
                  value={selectedAgentId}
                  onValueChange={(value) => setSelectedAgentId(value)}
                >
                  <SelectTrigger id="agent-selection">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      Usar agente padrão ou criar automaticamente
                    </SelectItem>
                    <SelectItem value="none">
                      Sem agente (configurar depois)
                    </SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {selectedAgentId === "auto"
                    ? "Um agente será associado automaticamente ou criado se necessário"
                    : selectedAgentId === "none"
                    ? "Você poderá associar a um agente posteriormente"
                    : "A instância será conectada ao agente selecionado"}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateInstance}
                disabled={isCreatingInstance}
              >
                {isCreatingInstance ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Criando...
                  </>
                ) : (
                  "Criar Instância"
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {creationStep === "connecting" && (
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              Criando instância...
            </h2>
            <p className="text-muted-foreground mb-6">
              Aguarde enquanto configuramos sua instância do WhatsApp
            </p>
          </div>
        )}

        {creationStep === "qrcode" && (
          <div className="py-2 text-center">
            <ConnectionStatus
              status={state.status}
              attempts={attempts}
              errorMessage={errorMessage}
            />

            {state.status === "awaiting_scan" && (
              <QRCodeDisplay qrCode={state.qr} />
            )}

            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  "Atualizar QR Code"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
