import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { QrCode, Loader2, CheckCircle2, XCircle, AlertTriangle, Wifi, WifiOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  initializeWhatsAppInstance, 
  checkWhatsAppStatus,
  testEvolutionAPIConnection
} from "@/lib/evolution-api";
import { APICredentialsForm } from "@/components/credentials/APICredentialsForm";

type ConnectionStatus = "loading" | "awaiting_scan" | "connected" | "error" | "testing_connection";

const WhatsAppQR = () => {
  const [searchParams] = useSearchParams()
  const agentId = searchParams.get("agent_id")
  const navigate = useNavigate()
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>("testing_connection")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [detailedErrors, setDetailedErrors] = useState<string[]>([])
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null)
  const [showCredentialsForm, setShowCredentialsForm] = useState(false)

  const testConnection = async () => {
    try {
      setStatus("testing_connection")
      setConnectionOk(null)
      
      console.log("Testando conexão com a Evolution API")
      const response = await testEvolutionAPIConnection()
      
      console.log("Teste de conexão:", response)
      setApiResponse(response)
      
      if (!response.success) {
        console.error("Falha no teste de conexão:", response)
        setConnectionOk(false)
        setErrorMessage(response.error || "Não foi possível conectar à Evolution API")
        
        const errors = []
        if (response.error) errors.push(response.error)
        if (response.details) errors.push(response.details)
        if (response.diagnostics) errors.push(JSON.stringify(response.diagnostics))
        setDetailedErrors(errors.filter(Boolean))
        
        toast.error("Erro de conexão com a Evolution API")
        return false
      }
      
      setConnectionOk(true)
      toast.success("Conexão com a Evolution API estabelecida")
      return true
    } catch (error: any) {
      console.error("Erro ao testar conexão:", error)
      setConnectionOk(false)
      setErrorMessage(error.message || "Erro desconhecido ao testar conexão")
      setDetailedErrors([`Detalhes técnicos: ${JSON.stringify(error)}`])
      toast.error("Erro ao testar conexão")
      return false
    }
  }

  const initializeConnection = async () => {
    if (!agentId) {
      toast.error("ID do agente não fornecido")
      navigate("/connect-whatsapp")
      return
    }

    if (connectionOk === null || connectionOk === false) {
      const connected = await testConnection()
      if (!connected) return
    }

    try {
      setStatus("loading")
      setErrorMessage(null)
      setDetailedErrors([])
      setApiResponse(null)
      console.log("Iniciando conexão para agente:", agentId)
      
      const response = await initializeWhatsAppInstance(agentId)
      console.log("Resposta da inicialização:", response)
      
      setApiResponse(response)
      
      if (!response.success) {
        console.error("Error response:", response)
        setStatus("error")
        setErrorMessage(response.error || "Erro desconhecido ao iniciar conexão")
        
        const errors = []
        if (response.error) errors.push(response.error)
        if (response.details) errors.push(response.details)
        if (response.diagnostics) errors.push(`Diagnóstico API: ${JSON.stringify(response.diagnostics)}`)
        setDetailedErrors(errors.filter(Boolean))
        
        toast.error("Erro ao conectar com Evolution API")
        return
      }

      if (response.qr || response.qrcode) {
        console.log("QR Code recebido, tamanho:", (response.qr || response.qrcode).length)
        setQrCode(response.qr || response.qrcode)
        setStatus("awaiting_scan")
      } else if (response.status === "connected") {
        setStatus("connected")
      } else {
        console.error("Resposta inesperada:", response)
        setStatus("error")
        setErrorMessage("Resposta inesperada do servidor")
        toast.error("Erro ao gerar QR code")
      }
    } catch (error: any) {
      console.error("Erro ao iniciar conexão:", error)
      setStatus("error")
      setErrorMessage(error.message || "Erro desconhecido")
      setDetailedErrors([`Detalhes técnicos: ${JSON.stringify(error)}`])
      toast.error("Erro ao iniciar conexão")
    }
  }

  const checkStatus = async () => {
    if (!agentId || status === "connected" || status === "testing_connection") return

    try {
      const response = await checkWhatsAppStatus(agentId)
      console.log("Status check response:", response)

      setApiResponse(response)

      if (!response.success) {
        throw new Error(response.error || "Erro ao verificar status")
      }

      if (response.status === "connected") {
        setStatus("connected")
        toast.success("WhatsApp conectado com sucesso!")
        setTimeout(() => navigate("/devices"), 3000)
      } else if ((response.qr || response.qrcode) && (response.qr || response.qrcode) !== qrCode) {
        console.log("Novo QR Code recebido")
        setQrCode(response.qr || response.qrcode)
        setStatus("awaiting_scan")
      }
    } catch (error: any) {
      console.error("Erro ao verificar status:", error)
    }
  }

  useEffect(() => {
    testConnection().then(connected => {
      if (connected) {
        initializeConnection()
      }
    })
    
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [agentId])

  useEffect(() => {
    if (status === "awaiting_scan") {
      setAttempts(prev => prev + 1)
    }
  }, [qrCode])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    if (status === "error" && (connectionOk === null || connectionOk === false)) {
      await testConnection()
    }
    await initializeConnection()
    setIsRefreshing(false)
  }

  const handleCredentialsSuccess = () => {
    setShowCredentialsForm(false)
    testConnection().then(connected => {
      if (connected) {
        initializeConnection();
      }
    });
  }

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Conectar WhatsApp</h1>
      
      <Card className="p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {status === "testing_connection" && <Wifi className="w-8 h-8 text-amber-500 animate-pulse" />}
            {status === "loading" && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
            {status === "awaiting_scan" && <QrCode className="w-8 h-8 text-primary" />}
            {status === "connected" && <CheckCircle2 className="w-8 h-8 text-green-500" />}
            {status === "error" && <XCircle className="w-8 h-8 text-destructive" />}
          </div>
          
          <h2 className="text-2xl font-semibold mb-2">
            {status === "testing_connection" && "Testando conexão com a API..."}
            {status === "loading" && "Iniciando conexão..."}
            {status === "awaiting_scan" && "Escaneie o QR Code"}
            {status === "connected" && "WhatsApp Conectado!"}
            {status === "error" && "Erro ao conectar"}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {status === "testing_connection" && "Verificando se a Evolution API está acessível..."}
            {status === "loading" && "Aguarde enquanto preparamos seu QR code"}
            {status === "awaiting_scan" && (
              <>
                Abra o WhatsApp no seu celular e escaneie o código QR
                {attempts > 1 && <div className="text-xs mt-1">Tentativa {attempts}</div>}
              </>
            )}
            {status === "connected" && "Redirecionando..."}
            {status === "error" && (errorMessage || "Não foi possível estabelecer a conexão")}
          </p>
        </div>

        {connectionOk === false && (
          <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-950 border-yellow-300 text-left">
            <Wifi className="h-4 w-4 mr-2 text-yellow-600" />
            <AlertDescription>
              <div className="font-semibold mb-2">Problemas de conexão com a Evolution API</div>
              <p className="text-sm">
                Não foi possível estabelecer conexão com o servidor da Evolution API. 
                Verifique se:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                <li>O servidor da Evolution API está em execução</li>
                <li>A URL configurada está correta</li>
                <li>A chave de API está correta</li>
                <li>Não há bloqueios de firewall ou rede</li>
              </ul>
              <div className="mt-3">
                <Dialog open={showCredentialsForm} onOpenChange={setShowCredentialsForm}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Settings className="w-4 h-4 mr-2" />
                      Atualizar Credenciais
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <APICredentialsForm onSuccess={handleCredentialsSuccess} />
                  </DialogContent>
                </Dialog>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {status === "awaiting_scan" && qrCode && (
          <div className="aspect-square max-w-[300px] mx-auto mb-6 bg-white p-4 rounded-lg">
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="WhatsApp QR Code"
              className="w-full h-full"
            />
          </div>
        )}

        {status === "error" && detailedErrors.length > 0 && (
          <Alert variant="destructive" className="mb-6 text-left">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>
              <div className="font-semibold mb-2">Detalhes do erro:</div>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {detailedErrors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
              <div className="mt-2 text-sm">
                Verifique se a Evolution API está configurada corretamente e acessível.
              </div>
            </AlertDescription>
          </Alert>
        )}

        {apiResponse && status === "error" && (
          <Alert variant="default" className="mb-6 text-left bg-amber-50 dark:bg-amber-950 border-amber-300">
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
            <AlertDescription>
              <div className="font-semibold mb-2">Resposta da API:</div>
              <div className="overflow-auto max-h-40 text-xs p-2 bg-black/10 rounded">
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center space-x-3">
          {(status === "awaiting_scan" || status === "error" || (status === "testing_connection" && connectionOk === false)) && (
            <Button
              variant={status === "error" ? "destructive" : "outline"}
              className="mx-auto"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {status === "testing_connection" ? "Testando..." : "Atualizando..."}
                </>
              ) : (
                status === "testing_connection" ? "Testar Novamente" : "Atualizar QR Code"
              )}
            </Button>
          )}
          
          {(status === "error" || connectionOk === false) && (
            <Button
              variant="outline"
              onClick={() => setShowCredentialsForm(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurar API
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

export default WhatsAppQR
