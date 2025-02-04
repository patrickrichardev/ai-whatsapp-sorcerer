import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { QrCode, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

const WhatsAppQR = () => {
  const [searchParams] = useSearchParams()
  const agentId = searchParams.get("agent_id")
  const navigate = useNavigate()
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [status, setStatus] = useState<"loading" | "awaiting_scan" | "connected" | "error">("loading")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const initializeConnection = async () => {
    if (!agentId) {
      toast.error("ID do agente não fornecido")
      navigate("/connect-whatsapp")
      return
    }

    try {
      setStatus("loading")
      const { data, error } = await supabase.functions.invoke("whatsapp-connection", {
        body: { action: "connect", agent_id: agentId }
      })

      if (error) throw error

      if (data.qr) {
        setQrCode(data.qr)
        setStatus("awaiting_scan")
      } else {
        setStatus("error")
        toast.error("Erro ao gerar QR code")
      }
    } catch (error) {
      console.error("Error:", error)
      setStatus("error")
      toast.error("Erro ao iniciar conexão")
    }
  }

  const checkStatus = async () => {
    if (!agentId) return

    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-connection", {
        body: { action: "status", agent_id: agentId }
      })

      if (error) throw error

      if (data.status === "connected") {
        setStatus("connected")
        toast.success("WhatsApp conectado com sucesso!")
        // Redireciona após 3 segundos
        setTimeout(() => navigate("/connect-whatsapp"), 3000)
      }
    } catch (error) {
      console.error("Error checking status:", error)
    }
  }

  useEffect(() => {
    initializeConnection()
    // Verifica o status a cada 5 segundos
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [agentId])

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
            {status === "awaiting_scan" && "Abra o WhatsApp no seu celular e escaneie o código QR"}
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