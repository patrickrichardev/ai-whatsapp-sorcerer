
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { QrCode, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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

  const initializeConnection = async () => {
    if (!agentId) {
      toast.error("ID do agente não fornecido")
      navigate("/connect-whatsapp")
      return
    }

    try {
      setStatus("loading")
      console.log("Iniciando conexão para agente:", agentId)
      
      const response = await initializeWhatsAppInstance(agentId)

      console.log("Resposta da função:", response)

      if (!response.success) {
        throw new Error(response.error || "Erro desconhecido ao iniciar conexão")
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
        toast.error("Erro ao gerar QR code")
      }
    } catch (error) {
      console.error("Erro ao iniciar conexão:", error)
      setStatus("error")
      toast.error("Erro ao iniciar conexão")
    }
  }

  const checkStatus = async () => {
    if (!agentId || status === "connected") return

    try {
      const response = await checkWhatsAppStatus(agentId)

      console.log("Status check response:", response)

      if (!response.success) {
        throw new Error(response.error || "Erro ao verificar status")
      }

      if (response.status === "connected") {
        setStatus("connected")
        toast.success("WhatsApp conectado com sucesso!")
        setTimeout(() => navigate("/connect-whatsapp"), 3000)
      } else if (response.qrcode && response.qrcode !== qrCode) {
        console.log("Novo QR Code recebido")
        setQrCode(response.qrcode)
        setStatus("awaiting_scan")
      }
    } catch (error) {
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
            {status === "error" && "Não foi possível estabelecer a conexão"}
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
