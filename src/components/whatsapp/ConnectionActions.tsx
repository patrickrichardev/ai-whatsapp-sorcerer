
import { Button } from "@/components/ui/button";
import { Loader2, Settings } from "lucide-react";

interface ConnectionActionsProps {
  status: "loading" | "awaiting_scan" | "connected" | "error" | "testing_connection";
  connectionOk: boolean | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onConfigureAPI: () => void;
}

export function ConnectionActions({ 
  status, 
  connectionOk, 
  isRefreshing, 
  onRefresh, 
  onConfigureAPI 
}: ConnectionActionsProps) {
  return (
    <div className="flex justify-center space-x-3">
      {(status === "awaiting_scan" || status === "error" || (status === "testing_connection" && connectionOk === false)) && (
        <Button
          variant={status === "error" ? "destructive" : "outline"}
          className="mx-auto"
          onClick={onRefresh}
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
          onClick={onConfigureAPI}
        >
          <Settings className="w-4 h-4 mr-2" />
          Configurar API
        </Button>
      )}
    </div>
  );
}
