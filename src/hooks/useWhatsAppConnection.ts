
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  initializeWhatsAppInstance, 
  checkWhatsAppStatus,
  testEvolutionAPIConnection
} from "@/lib/evolution-api";
import { EvolutionAPIResponse } from "@/lib/evolution-api/types";

export type ConnectionStatus = "loading" | "awaiting_scan" | "connected" | "error" | "testing_connection";

export function useWhatsAppConnection(connectionId: string | null) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("testing_connection");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detailedErrors, setDetailedErrors] = useState<string[]>([]);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);

  const testConnection = async () => {
    try {
      setStatus("testing_connection");
      setConnectionOk(null);
      
      console.log("Testando conexão com a Evolution API");
      const response = await testEvolutionAPIConnection();
      
      console.log("Teste de conexão:", response);
      setApiResponse(response);
      
      if (!response.success) {
        console.error("Falha no teste de conexão:", response);
        setConnectionOk(false);
        setErrorMessage(response.error || "Não foi possível conectar à Evolution API");
        
        const errors = [];
        if (response.error) errors.push(response.error);
        if (response.details) errors.push(response.details);
        if (response.diagnostics) errors.push(JSON.stringify(response.diagnostics));
        setDetailedErrors(errors.filter(Boolean));
        
        toast.error("Erro de conexão com a Evolution API");
        return false;
      }
      
      setConnectionOk(true);
      toast.success("Conexão com a Evolution API estabelecida");
      return true;
    } catch (error: any) {
      console.error("Erro ao testar conexão:", error);
      setConnectionOk(false);
      setErrorMessage(error.message || "Erro desconhecido ao testar conexão");
      setDetailedErrors([`Detalhes técnicos: ${JSON.stringify(error)}`]);
      toast.error("Erro ao testar conexão");
      return false;
    }
  };

  const initializeConnection = async () => {
    if (!connectionId) {
      toast.error("ID da conexão não fornecido");
      return;
    }

    if (connectionOk === null || connectionOk === false) {
      const connected = await testConnection();
      if (!connected) return;
    }

    try {
      setStatus("loading");
      setErrorMessage(null);
      setDetailedErrors([]);
      setApiResponse(null);
      console.log("Iniciando conexão para ID:", connectionId);
      
      const response = await initializeWhatsAppInstance(connectionId);
      console.log("Resposta da inicialização:", response);
      
      setApiResponse(response);
      
      if (!response.success) {
        console.error("Error response:", response);
        setStatus("error");
        setErrorMessage(response.error || "Erro desconhecido ao iniciar conexão");
        
        const errors = [];
        if (response.error) errors.push(response.error);
        if (response.details) errors.push(response.details);
        if (response.diagnostics) errors.push(`Diagnóstico API: ${JSON.stringify(response.diagnostics)}`);
        setDetailedErrors(errors.filter(Boolean));
        
        toast.error("Erro ao conectar com Evolution API");
        return;
      }

      if (response.qr || response.qrcode) {
        const qrData = response.qr || response.qrcode;
        console.log("QR Code recebido, tamanho:", qrData?.length);
        setQrCode(qrData);
        setStatus("awaiting_scan");
      } else if (response.status === "connected") {
        setStatus("connected");
      } else {
        console.error("Resposta inesperada:", response);
        setStatus("error");
        setErrorMessage("Resposta inesperada do servidor");
        toast.error("Erro ao gerar QR code");
      }
    } catch (error: any) {
      console.error("Erro ao iniciar conexão:", error);
      setStatus("error");
      setErrorMessage(error.message || "Erro desconhecido");
      setDetailedErrors([`Detalhes técnicos: ${JSON.stringify(error)}`]);
      toast.error("Erro ao iniciar conexão");
    }
  };

  const checkStatus = async () => {
    if (!connectionId || status === "connected" || status === "testing_connection") return;

    try {
      const response = await checkWhatsAppStatus(connectionId);
      console.log("Status check response:", response);

      setApiResponse(response);

      if (!response.success) {
        throw new Error(response.error || "Erro ao verificar status");
      }

      if (response.status === "connected") {
        setStatus("connected");
        toast.success("WhatsApp conectado com sucesso!");
        return true;
      } else if ((response.qr || response.qrcode) && (response.qr || response.qrcode) !== qrCode) {
        const qrData = response.qr || response.qrcode;
        console.log("Novo QR Code recebido");
        setQrCode(qrData);
        setStatus("awaiting_scan");
      }
      return false;
    } catch (error: any) {
      console.error("Erro ao verificar status:", error);
      return false;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (status === "error" && (connectionOk === null || connectionOk === false)) {
      await testConnection();
    }
    await initializeConnection();
    setIsRefreshing(false);
  };

  return {
    qrCode,
    status,
    isRefreshing,
    attempts,
    errorMessage,
    detailedErrors,
    apiResponse,
    connectionOk,
    testConnection,
    initializeConnection,
    checkStatus,
    handleRefresh,
    setAttempts
  };
}
