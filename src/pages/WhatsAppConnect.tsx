
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppConnect() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [instanceId, setInstanceId] = useState<string>("");
  const [statusCheckInterval, setStatusCheckInterval] = useState<number | null>(null);

  // Gera um ID para a instância caso não exista
  useEffect(() => {
    if (!instanceId) {
      setInstanceId(`instance_${Math.random().toString(36).substring(2, 9)}`);
    }
  }, [instanceId]);

  // Limpa o intervalo quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // Inicia o processo de conexão
  const startConnection = async () => {
    try {
      setLoading(true);
      setQrCode(null);
      setConnected(false);
      
      // Remove o intervalo anterior se existir
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }

      // Chama a Evolution API para criar e conectar a instância
      const { data, error } = await supabase.functions.invoke("evolution-whatsapp", {
        body: { action: "getQRCode", instanceId }
      });

      if (error) {
        throw new Error(`Erro ao obter QR code: ${error.message}`);
      }

      if (data?.qrCode) {
        setQrCode(data.qrCode);
        toast.success("QR Code gerado com sucesso. Escaneie com seu WhatsApp");
        
        // Inicia o monitoramento do status
        const intervalId = window.setInterval(checkConnectionStatus, 2000);
        setStatusCheckInterval(intervalId as unknown as number);
      } else {
        throw new Error("QR Code não recebido da API");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao conectar WhatsApp");
      console.error("Erro ao iniciar conexão:", error);
    } finally {
      setLoading(false);
    }
  };

  // Verifica o status da conexão
  const checkConnectionStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("evolution-whatsapp", {
        body: { action: "checkStatus", instanceId }
      });

      if (error) {
        console.error("Erro ao verificar status:", error);
        return;
      }

      console.log("Status atual:", data?.status);

      // Se o status for "connected" ou "open", significa que o WhatsApp está conectado
      if (data?.status === "connected" || data?.status === "open") {
        setConnected(true);
        toast.success("WhatsApp conectado com sucesso!");
        
        // Limpa o intervalo de verificação
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error);
    }
  };

  return (
    <div className="container py-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Conectar WhatsApp</h1>
      
      <Card className="p-6">
        {connected ? (
          <div className="text-center">
            <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
              <h2 className="font-bold text-xl">WhatsApp Conectado!</h2>
              <p className="mt-2">Sua instância está conectada e pronta para uso.</p>
            </div>
            
            <Button onClick={startConnection} variant="outline">
              Reconectar
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {qrCode ? (
              <div className="text-center">
                <h2 className="font-bold text-xl mb-4">Escaneie o QR Code</h2>
                <div className="bg-white p-4 rounded-lg inline-block mx-auto">
                  <img 
                    src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`} 
                    alt="WhatsApp QR Code" 
                    className="max-w-[250px] mx-auto"
                  />
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Abra o WhatsApp no seu celular e escaneie o código QR acima
                </p>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="font-bold text-xl mb-4">Conectar WhatsApp</h2>
                <p className="mb-4">
                  Clique no botão abaixo para gerar um QR code e conectar seu WhatsApp
                </p>
                
                <Button 
                  onClick={startConnection} 
                  disabled={loading}
                  className="mx-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando QR Code...
                    </>
                  ) : "Gerar QR Code"}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
