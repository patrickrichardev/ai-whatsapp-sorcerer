import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  initializeWhatsAppInstance,
  checkWhatsAppStatus,
  testEvolutionAPIConnection,
} from "@/lib/evolution-api";
import { EvolutionAPIResponse } from "@/lib/evolution-api/types";

export type ConnectionStatus =
  | "loading"
  | "awaiting_scan"
  | "connected"
  | "error"
  | "testing_connection"
  | "pending";

interface InstanceData {
  instanceCreated: boolean;
  instanceName?: string;
}

interface ErrorDetails {
  message: string;
  details: string[];
}

interface ConnectionState {
  qrCode: string | null;
  status: ConnectionStatus;
  isRefreshing: boolean;
  attempts: number;
  errorMessage: string | null;
  detailedErrors: string[];
  apiResponse: EvolutionAPIResponse | null;
  connectionOk: boolean | null;
  instanceData: InstanceData | null;
}

const initialState: ConnectionState = {
  qrCode: null,
  status: "awaiting_scan",
  isRefreshing: false,
  attempts: 0,
  errorMessage: null,
  detailedErrors: [],
  apiResponse: null,
  connectionOk: null,
  instanceData: null,
};

export function useWhatsAppConnection(connectionId: string | null) {
  const [state, setState] = useState<ConnectionState>(initialState);

  const updateState = (updates: Partial<ConnectionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleError = (error: Error, context: string): ErrorDetails => {
    console.error(`Erro ao ${context}:`, error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return {
      message,
      details: [`Detalhes técnicos: ${JSON.stringify(error)}`]
    };
  };

  const processApiResponse = (response: EvolutionAPIResponse) => {
    updateState({ apiResponse: response });

    if (!response.success && !response.partialSuccess) {
      const errors = [
        response.error,
        response.details,
        response.diagnostics ? `Diagnóstico API: ${JSON.stringify(response.diagnostics)}` : null
      ].filter(Boolean);

      updateState({
        status: "error",
        errorMessage: response.error || "Erro desconhecido ao iniciar conexão",
        detailedErrors: errors as string[]
      });

      toast.error("Erro ao conectar com Evolution API");
      return false;
    }

    return true;
  };

  const processQrCode = (response: EvolutionAPIResponse) => {
    const qrData = response.qr || response.qrcode;
    if (qrData) {
      console.log("QR Code recebido, tamanho:", qrData.length);
      updateState({
        qrCode: qrData,
        status: "awaiting_scan",
        attempts: state.attempts + 1
      });
      return true;
    }
    return false;
  };

  const testConnection = useCallback(async () => {
    try {
      updateState({ status: "testing_connection", connectionOk: null });
      console.log("Testando conexão com a Evolution API");
      
      const response = await testEvolutionAPIConnection();
      console.log("Teste de conexão:", response);

      if (!response.success) {
        const errors = [
          response.error,
          response.details,
          response.diagnostics ? JSON.stringify(response.diagnostics) : null
        ].filter(Boolean);

        updateState({
          connectionOk: false,
          errorMessage: response.error || "Não foi possível conectar à Evolution API",
          detailedErrors: errors as string[]
        });

        toast.error("Erro de conexão com a Evolution API");
        return false;
      }

      updateState({ connectionOk: true });
      toast.success("Conexão com a Evolution API estabelecida");
      return true;
    } catch (error) {
      const { message, details } = handleError(error as Error, "testar conexão");
      updateState({
        connectionOk: false,
        errorMessage: message,
        detailedErrors: details
      });
      toast.error("Erro ao testar conexão");
      return false;
    }
  }, []);

  const checkStatus = useCallback(async () => {
    if (!connectionId || state.status === "connected" || state.status === "testing_connection") {
      return false;
    }

    try {
      console.log("Verificando status para conexão:", connectionId);
      const response = await checkWhatsAppStatus(connectionId);
      console.log("Status check response:", response);

      updateState({ apiResponse: response });

      if (!response.success) {
        throw new Error(response.error || "Erro ao verificar status");
      }

      if (response.status === "connected") {
        updateState({ status: "connected" });
        toast.success("WhatsApp conectado com sucesso!");
        return true;
      }

      return processQrCode(response);
    } catch (error) {
      handleError(error as Error, "verificar status");
      return false;
    }
  }, [connectionId, state.status]);

  const initializeConnection = useCallback(async () => {
    if (!connectionId) {
      toast.error("ID da conexão não fornecido");
      return;
    }

    if (state.connectionOk === null || state.connectionOk === false) {
      const connected = await testConnection();
      if (!connected) return;
    }

    try {
      updateState({
        status: "loading",
        errorMessage: null,
        detailedErrors: [],
        apiResponse: null,
        instanceData: null
      });

      console.log("Iniciando conexão para ID:", connectionId);
      const response = await initializeWhatsAppInstance(connectionId);
      console.log("Resposta da inicialização:", response);

      if (!processApiResponse(response)) return;

      if (response.instanceCreated) {
        updateState({
          instanceData: {
            instanceCreated: true,
            instanceName: response.instanceName
          }
        });
      }

      if (processQrCode(response)) return;

      if (response.status === "connected") {
        updateState({ status: "connected" });
      } else if (response.partialSuccess) {
        updateState({ status: "pending" });
        toast.info("Instância criada, buscando QR code...");
        setTimeout(checkStatus, 3000);
      } else {
        updateState({
          status: "error",
          errorMessage: "Resposta inesperada do servidor"
        });
        toast.error("Erro ao gerar QR code");
      }
    } catch (error) {
      const { message, details } = handleError(error as Error, "iniciar conexão");
      updateState({
        status: "error",
        errorMessage: message,
        detailedErrors: details
      });
      toast.error("Erro ao iniciar conexão");
    }
  }, [checkStatus, connectionId, state.connectionOk, testConnection]);

  const handleRefresh = useCallback(async () => {
    updateState({ isRefreshing: true });

    if (state.status === "error" && (state.connectionOk === null || state.connectionOk === false)) {
      await testConnection();
    }

    if (state.instanceData?.instanceCreated) {
      await checkStatus();
    } else {
      await initializeConnection();
    }

    updateState({ isRefreshing: false });
  }, [state.status, state.connectionOk, state.instanceData, testConnection, checkStatus, initializeConnection]);

  useEffect(() => {
    let intervalId: number | undefined;

    if (state.status === "awaiting_scan" && connectionId) {
      intervalId = window.setInterval(async () => {
        const isConnected = await checkStatus();
        if (isConnected) {
          clearInterval(intervalId);
        }
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [state.status, connectionId, checkStatus]);

  return {
    ...state,
    testConnection,
    initializeConnection,
    checkStatus,
    handleRefresh,
    setAttempts: (attempts: number) => updateState({ attempts })
  };
}