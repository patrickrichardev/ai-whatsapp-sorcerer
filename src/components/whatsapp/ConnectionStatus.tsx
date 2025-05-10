
import { Loader2, CheckCircle2, XCircle, Wifi, QrCode, Clock } from "lucide-react";

export type ConnectionStatus = "loading" | "awaiting_scan" | "connected" | "error" | "testing_connection" | "pending";

interface ConnectionStatusProps {
  status: ConnectionStatus;
  attempts?: number;
  errorMessage?: string | null;
}

export function ConnectionStatus({ status, attempts, errorMessage }: ConnectionStatusProps) {
  console.log(`ConnectionStatus Component, status:${status}`)
  return (
    <div className="mb-6">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        {status === "testing_connection" && <Wifi className="w-8 h-8 text-amber-500 animate-pulse" />}
        {status === "loading" && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
        {status === "awaiting_scan" && <QrCode className="w-8 h-8 text-primary" />}
        {status === "connected" && <CheckCircle2 className="w-8 h-8 text-green-500" />}
        {status === "error" && <XCircle className="w-8 h-8 text-destructive" />}
        {status === "pending" && <Clock className="w-8 h-8 text-amber-500 animate-pulse" />}
      </div>
      
      <h2 className="text-2xl font-semibold mb-2">
        {status === "testing_connection" && "Testando conexão com a API..."}
        {status === "loading" && "Iniciando conexão..."}
        {status === "awaiting_scan" && "Escaneie o QR Code"}
        {status === "connected" && "WhatsApp Conectado!"}
        {status === "error" && "Erro ao conectar"}
        {status === "pending" && "Instância Criada, Aguardando QR Code..."}
      </h2>
      
      <p className="text-muted-foreground mb-6">
        {status === "testing_connection" && "Verificando se a Evolution API está acessível..."}
        {status === "loading" && "Aguarde enquanto preparamos seu QR code"}
        {status === "awaiting_scan" && (
          <>
            Abra o WhatsApp no seu celular e escaneie o código QR
            {attempts && attempts > 1 && <div className="text-xs mt-1">Tentativa {attempts}</div>}
          </>
        )}
        {status === "connected" && "Redirecionando..."}
        {status === "error" && (errorMessage || "Não foi possível estabelecer a conexão")}
        {status === "pending" && "A instância foi criada com sucesso, aguardando geração do QR code..."}
      </p>
    </div>
  );
}
