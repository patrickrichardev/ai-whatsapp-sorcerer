
import { useState, useEffect, useCallback } from "react";
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
  const [checkIntervalId, setCheckIntervalId] = useState<number | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  // Função para testar a conexão com a Evolution API
  const testConnection = useCallback(async () => {
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
  }, []);

  // Função para inicializar a conexão
  const initializeConnection = useCallback(async () => {
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
      setIsRefreshing(true);
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
        
        // Start automatic status checking if QR code is received
        startStatusCheck();
      } else if (response.status === "connected") {
        setStatus("connected");
      } else {
        console.log("Resposta recebida sem QR code ou status connected:", response);
        startStatusCheck(); // Tentar verificar status mesmo assim
      }
    } catch (error: any) {
      console.error("Erro ao iniciar conexão:", error);
      setStatus("error");
      setErrorMessage(error.message || "Erro desconhecido");
      setDetailedErrors([`Detalhes técnicos: ${JSON.stringify(error)}`]);
      toast.error("Erro ao iniciar conexão");
    } finally {
      setIsRefreshing(false);
    }
  }, [connectionId, connectionOk, testConnection]);

  // Função para verificar o status da conexão
  const checkStatus = useCallback(async () => {
    if (!connectionId || status === "testing_connection") return false;

    try {
      const response = await checkWhatsAppStatus(connectionId);
      console.log("Status check response:", response);

      setApiResponse(response);
      setConsecutiveFailures(0); // Resetar contador de falhas consecutivas

      if (!response.success) {
        throw new Error(response.error || "Erro ao verificar status");
      }

      if (response.status === "connected") {
        setStatus("connected");
        toast.success("WhatsApp conectado com sucesso!");
        
        // Stop checking once connected
        stopStatusCheck();
        
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
      setConsecutiveFailures(prev => prev + 1);
      
      // Se houverem muitas falhas consecutivas, tentar reiniciar
      if (consecutiveFailures >= 3) {
        console.log("Muitas falhas consecutivas. Tentando reiniciar a conexão...");
        stopStatusCheck();
        await new Promise(resolve => setTimeout(resolve, 1000)); // pequeno delay
        initializeConnection();
      }
      
      return false;
    }
  }, [connectionId, status, qrCode, consecutiveFailures, initializeConnection]);

  // Função para iniciar a verificação periódica do status
  const startStatusCheck = useCallback(() => {
    // Clear any existing interval
    stopStatusCheck();
    
    // Check status immediately
    checkStatus();
    
    // Then set up interval
    const intervalId = window.setInterval(() => {
      checkStatus();
    }, 5000); // Check every 5 seconds
    
    // Update state with the interval ID
    setCheckIntervalId(intervalId);
  }, [checkStatus]);

  // Função para parar a verificação periódica do status
  const stopStatusCheck = useCallback(() => {
    if (checkIntervalId) {
      window.clearInterval(checkIntervalId);
      setCheckIntervalId(null);
    }
  }, [checkIntervalId]);

  // Função para atualizar a conexão
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (status === "error" && (connectionOk === null || connectionOk === false)) {
        await testConnection();
      }
      await initializeConnection();
    } finally {
      setIsRefreshing(false);
    }
  }, [status, connectionOk, testConnection, initializeConnection]);

  // Inicializar conexão no mount
  useEffect(() => {
    if (connectionId) {
      initializeConnection();
    }
    
    return () => {
      // Clear any interval on unmount
      stopStatusCheck();
    };
  }, [connectionId, initializeConnection, stopStatusCheck]);

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
