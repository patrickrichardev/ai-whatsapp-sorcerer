
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { APICredentialsForm } from "@/components/credentials/APICredentialsForm";
import { ConnectionStatus } from "@/components/whatsapp/ConnectionStatus";
import { QRCodeDisplay } from "@/components/whatsapp/QRCodeDisplay";
import { ConnectionError } from "@/components/whatsapp/ConnectionError";
import { ConnectionActions } from "@/components/whatsapp/ConnectionActions";
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";

const WhatsAppQR = () => {
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get("agent_id");
  const navigate = useNavigate();
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  
  const {
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
  } = useWhatsAppConnection(agentId);

  const handleCredentialsSuccess = () => {
    setShowCredentialsForm(false);
    testConnection().then(connected => {
      if (connected) {
        initializeConnection();
      }
    });
  };

  useEffect(() => {
    testConnection().then(connected => {
      if (connected) {
        initializeConnection();
      }
    });
    
    const interval = setInterval(async () => {
      if (status === "awaiting_scan") {
        const isConnected = await checkStatus();
        if (isConnected) {
          setTimeout(() => navigate("/devices"), 3000);
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [agentId, status]);

  useEffect(() => {
    if (status === "awaiting_scan") {
      setAttempts(prev => prev + 1);
    }
  }, [qrCode]);

  if (!agentId) {
    toast.error("ID do dispositivo não fornecido");
    navigate("/connect-whatsapp");
    return null;
  }

  return (
    <div className="animate-fadeIn max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Conectar WhatsApp</h1>
      
      <Card className="p-8 text-center">
        <ConnectionStatus 
          status={status} 
          attempts={attempts} 
          errorMessage={errorMessage}
        />
        
        <ConnectionError
          connectionOk={connectionOk}
          detailedErrors={detailedErrors}
          apiResponse={status === "error" ? apiResponse : null}
          onUpdateCredentials={() => setShowCredentialsForm(true)}
        />

        {status === "awaiting_scan" && (
          <QRCodeDisplay qrCode={qrCode} />
        )}

        <ConnectionActions
          status={status}
          connectionOk={connectionOk}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onConfigureAPI={() => setShowCredentialsForm(true)}
        />
      </Card>

      <Dialog open={showCredentialsForm} onOpenChange={setShowCredentialsForm}>
        <DialogContent>
          <APICredentialsForm onSuccess={handleCredentialsSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppQR;
