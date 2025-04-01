
import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAgents } from "@/hooks/useAgents"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNavigate } from "react-router-dom"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { ChevronDown, ChevronUp } from "lucide-react"

interface CreateInstanceDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  userId: string | undefined
  onSuccess: () => void
}

interface InstanceFormData {
  instanceName: string
  phone: string
  selectedAgentId: string
  // Basic settings
  rejectCalls: boolean
  rejectCallMessage: string
  ignoreGroups: boolean
  alwaysOnline: boolean
  readMessages: boolean
  readStatus: boolean
  syncFullHistory: boolean
  // Advanced settings
  webhookUrl: string
  webhookByEvents: boolean
  webhookBase64: boolean
}

export function CreateInstanceDialog({ isOpen, onOpenChange, userId, onSuccess }: CreateInstanceDialogProps) {
  const [isCreatingInstance, setIsCreatingInstance] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const { agents } = useAgents(userId)
  const navigate = useNavigate()
  
  const form = useForm<InstanceFormData>({
    defaultValues: {
      instanceName: "",
      phone: "",
      selectedAgentId: "auto",
      // Basic settings
      rejectCalls: true,
      rejectCallMessage: "Não posso atender no momento, mas deixe sua mensagem.",
      ignoreGroups: true,
      alwaysOnline: true,
      readMessages: true,
      readStatus: true,
      syncFullHistory: true,
      // Advanced settings
      webhookUrl: "",
      webhookByEvents: false,
      webhookBase64: false
    }
  })

  const handleCreateInstance = async (data: InstanceFormData) => {
    if (!data.instanceName) {
      toast.error("Por favor, forneça um nome para a instância")
      return
    }
    
    if (!userId) {
      toast.error("Usuário não identificado")
      return
    }
    
    setIsCreatingInstance(true)
    try {
      console.log("Creating instance with name:", data.instanceName);
      
      // Create a WhatsApp connection record directly with a unique ID
      const connectionId = crypto.randomUUID()
      
      // Prepare connection configuration
      const connectionConfig = {
        name: data.instanceName,
        status: 'creating',
        phone: data.phone || undefined,
        use_default_agent: data.selectedAgentId === "auto",
        // Basic settings
        rejectCalls: data.rejectCalls,
        rejectCallMessage: data.rejectCallMessage,
        ignoreGroups: data.ignoreGroups,
        alwaysOnline: data.alwaysOnline,
        readMessages: data.readMessages,
        readStatus: data.readStatus,
        syncFullHistory: data.syncFullHistory,
        // Advanced settings
        webhookUrl: data.webhookUrl || undefined,
        webhookByEvents: data.webhookByEvents,
        webhookBase64: data.webhookBase64
      }
      
      // Create the connection record
      const { error: connectionError } = await supabase
        .from('agent_connections')
        .insert({
          id: connectionId,
          platform: 'whatsapp',
          is_active: false,
          agent_id: data.selectedAgentId !== "auto" && data.selectedAgentId !== "none" ? data.selectedAgentId : null,
          connection_data: connectionConfig
        })
      
      if (connectionError) {
        console.error("Error creating connection:", connectionError);
        throw connectionError;
      }
      
      console.log("Connection created with ID:", connectionId);
      
      // Se selecionou "auto" e não há agentes disponíveis, cria um agente temporário
      if (data.selectedAgentId === "auto" && agents.length === 0) {
        // Criar um agente temporário com nome padrão
        const { data: newAgent, error: agentError } = await supabase
          .from('agents')
          .insert({
            user_id: userId,
            name: `Agente automático (${data.instanceName})`,
            prompt: "Você é um assistente útil e amigável.",
            temperature: 0.7
          })
          .select('id')
          .single()
        
        if (agentError) {
          console.error("Error creating agent:", agentError);
          throw agentError;
        }
        
        // Atualizar a conexão com o ID do novo agente
        if (newAgent) {
          await supabase
            .from('agent_connections')
            .update({ agent_id: newAgent.id })
            .eq('id', connectionId)
          
          console.log("Updated connection with agent ID:", newAgent.id);
        }
      }
      
      toast.success("Instância criada com sucesso! Redirecionando para configuração...")
      onOpenChange(false)
      
      // Call onSuccess to refresh the devices list
      onSuccess()
      
      // Imediatamente redirecionar para a página do QR code
      console.log("Redirecting to WhatsApp QR page with connection ID:", connectionId);
      navigate(`/whatsapp-qr?connection_id=${connectionId}`)
    } catch (error: any) {
      console.error("Erro ao criar instância:", error)
      toast.error(`Erro ao criar instância: ${error.message}`)
    } finally {
      setIsCreatingInstance(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Instância</DialogTitle>
          <DialogDescription>
            Configure sua nova instância do WhatsApp
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateInstance)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="instanceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Instância</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Suporte, Vendas, etc."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Telefone (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: 5511999990000 (com código do país)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Inclua o código do país (Ex: 55 para Brasil) sem símbolos ou espaços
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="selectedAgentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Associar a um Agente</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="auto">
                            Usar agente padrão ou criar automaticamente
                          </SelectItem>
                          <SelectItem value="none">
                            Sem agente (configurar depois)
                          </SelectItem>
                          {agents.map(agent => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {field.value === "auto" 
                          ? "Um agente será associado automaticamente ou criado se necessário"
                          : field.value === "none" 
                            ? "Você poderá associar a um agente posteriormente"
                            : "A instância será conectada ao agente selecionado"}
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                {/* Configurações básicas */}
                <Collapsible 
                  open={advancedOpen} 
                  onOpenChange={setAdvancedOpen}
                  className="border rounded-md p-3"
                >
                  <CollapsibleTrigger className="flex justify-between w-full items-center">
                    <span className="font-medium">Configurações adicionais</span>
                    {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <FormField
                      control={form.control}
                      name="rejectCalls"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Recusar chamadas</FormLabel>
                            <FormDescription>
                              Recusa automaticamente chamadas de voz e vídeo
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("rejectCalls") && (
                      <FormField
                        control={form.control}
                        name="rejectCallMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensagem após recusa</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Mensagem enviada após recusar uma chamada
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="ignoreGroups"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Ignorar grupos</FormLabel>
                            <FormDescription>
                              Não processa mensagens de grupos
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="alwaysOnline"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Sempre online</FormLabel>
                            <FormDescription>
                              Manter status "online" no WhatsApp
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="readMessages"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Marcar mensagens como lidas</FormLabel>
                            <FormDescription>
                              Enviar confirmação de leitura automaticamente
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="readStatus"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Mostrar status de leitura</FormLabel>
                            <FormDescription>
                              Mostrar status de leitura das mensagens enviadas
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="syncFullHistory"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Sincronizar histórico completo</FormLabel>
                            <FormDescription>
                              Sincronizar todo o histórico de mensagens e conversas
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="webhookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Webhook (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://seu-servidor.com/webhook"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        URL para receber notificações de eventos do WhatsApp
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="webhookByEvents"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Webhook por eventos</FormLabel>
                        <FormDescription>
                          Enviar notificações por evento para o webhook
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="webhookBase64"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Webhook com mídia em base64</FormLabel>
                        <FormDescription>
                          Envia arquivos de mídia em base64 via webhook
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button 
                type="submit"
                disabled={isCreatingInstance}
              >
                {isCreatingInstance ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Criando...
                  </>
                ) : "Criar Instância"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
