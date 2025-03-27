
import { AlertTriangle, Wifi, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { APICredentialsForm } from "@/components/credentials/APICredentialsForm";
import { useState } from "react";

interface ConnectionErrorProps {
  connectionOk: boolean | null;
  detailedErrors: string[];
  apiResponse: any;
  onUpdateCredentials: () => void;
}

export function ConnectionError({ 
  connectionOk, 
  detailedErrors, 
  apiResponse,
  onUpdateCredentials
}: ConnectionErrorProps) {
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  
  const handleCredentialsSuccess = () => {
    setShowCredentialsForm(false);
    onUpdateCredentials();
  };
  
  return (
    <>
      {connectionOk === false && (
        <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-950 border-yellow-300 text-left">
          <Wifi className="h-4 w-4 mr-2 text-yellow-600" />
          <AlertDescription>
            <div className="font-semibold mb-2">Problemas de conexão com a Evolution API</div>
            <p className="text-sm">
              Não foi possível estabelecer conexão com o servidor da Evolution API. 
              Verifique se:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
              <li>O servidor da Evolution API está em execução</li>
              <li>A URL configurada está correta</li>
              <li>A chave de API está correta</li>
              <li>Não há bloqueios de firewall ou rede</li>
            </ul>
            <div className="mt-3">
              <Dialog open={showCredentialsForm} onOpenChange={setShowCredentialsForm}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Settings className="w-4 h-4 mr-2" />
                    Atualizar Credenciais
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <APICredentialsForm onSuccess={handleCredentialsSuccess} />
                </DialogContent>
              </Dialog>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {detailedErrors.length > 0 && (
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

      {apiResponse && (
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
    </>
  );
}
