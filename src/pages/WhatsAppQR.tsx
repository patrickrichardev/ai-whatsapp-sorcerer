
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { QrCode, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { 
  initializeWhatsAppInstance, 
  checkWhatsAppStatus 
} from "@/lib/evolution-api"

type ConnectionStatus = "loading" | "awaiting_scan" | "connected" | "error";

const WhatsAppQR = () => {
  const [searchParams] = useSearchParams()
  const agentId = searchParams.get("agent_id")
  const navigate = useNavigate()
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>("loading")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [detailedErrors, setDetailedErrors] = useState<string[]>([])
  const [apiResponse, setApiResponse] = useState<any>(null)

  const initializeConnection = async () => {
    if (!agentId) {
      toast.error("ID do agente não fornecido")
      navigate("/connect-whatsapp")
      return
    }

    try {
      setStatus("loading")
      setErrorMessage(null)
      setDetailedErrors([])
      setApiResponse(null)
      console.log("Iniciando conexão para agente:", agentId)
      
      const response = await initializeWhatsAppInstance(agentId)
      console.log("Resposta da inicialização:", response)
      
      // Armazena a resposta completa para inspeção
      setApiResponse(response)
      
      if (!response.success) {
        console.error("Error response:", response)
        setStatus("error")
        setErrorMessage(response.error || "Erro desconhecido ao iniciar conexão")
        
        // Adiciona mensagens detalhadas de erro para ajudar na depuração
        const errors = []
        if (response.error) errors.push(response.error)
        if (response.details) errors.push(response.details)
        setDetailedErrors(errors.filter(Boolean))
        
        toast.error("Erro ao conectar com Evolution API")
        return
      }

      if (response.qrcode) {
        console.log("QR Code recebido, tamanho:", response.qrcode.length)
        setQrCode(response.qrcode)
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
    if (!agentId || status === "connected") return

    try {
      const response = await checkWhatsAppStatus(agentId)
      console.log("Status check response:", response)

      // Armazena a resposta completa para inspeção
      setApiResponse(response)

      if (!response.success) {
        throw new Error(response.error || "Erro ao verificar status")
      }

      if (response.status === "connected") {
        setStatus("connected")
        toast.success("WhatsApp conectado com sucesso!")
        setTimeout(() => navigate("/devices"), 3000)
      } else if (response.qrcode && response.qrcode !== qrCode) {
        console.log("Novo QR Code recebido")
        setQrCode(response.qrcode)
        setStatus("awaiting_scan")
      }
    } catch (error: any) {
      console.error("Erro ao verificar status:", error)
    }
  }

  useEffect(() => {
    initializeConnection()
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
    await initializeConnection()
    setIsRefreshing(false)
  }

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Conectar WhatsApp</h1>
      
      <Card className="p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {status === "loading" && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
            {status === "awaiting_scan" && <QrCode className="w-8 h-8 text-primary" />}
            {status === "connected" && <CheckCircle2 className="w-8 h-8 text-green-500" />}
            {status === "error" && <XCircle className="w-8 h-8 text-destructive" />}
          </div>
          
          <h2 className="text-2xl font-semibold mb-2">
            {status === "loading" && "Iniciando conexão..."}
            {status === "awaiting_scan" && "Escaneie o QR Code"}
            {status === "connected" && "WhatsApp Conectado!"}
            {status === "error" && "Erro ao conectar"}
          </h2>
          
          <p className="text-muted-foreground mb-6">
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

        {(status === "awaiting_scan" || status === "error") && (
          <Button
            variant="outline"
            className="mx-auto"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Atualizando...
              </>
            ) : (
              "Atualizar QR Code"
            )}
          </Button>
        )}
      </Card>
    </div>
  )
}

export default WhatsAppQR
