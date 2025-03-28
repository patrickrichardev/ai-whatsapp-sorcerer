
import { useState } from "react";
import { updateEvolutionAPICredentials, testEvolutionAPIConnection } from "@/lib/evolution-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface APICredentialsFormProps {
  onSuccess?: () => void;
}

export function APICredentialsForm({ onSuccess }: APICredentialsFormProps) {
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiUrl || !apiKey) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Atualiza as credenciais localmente primeiro
      updateEvolutionAPICredentials({ apiUrl, apiKey });
      
      // Testa a conexão
      const response = await testEvolutionAPIConnection({ apiUrl, apiKey });
      
      if (!response.success) {
        throw new Error(response.error || "Falha ao testar conexão");
      }
      
      toast.success("Conexão estabelecida com sucesso!");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Erro ao testar conexão:", error);
      toast.error(`Erro ao testar conexão: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Configuração da Evolution API</h2>
        <p className="text-sm text-muted-foreground">
          Configure os detalhes de conexão para o servidor da Evolution API
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-url">URL da API</Label>
          <Input 
            id="api-url" 
            placeholder="https://sua-evolution-api.com" 
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Por exemplo: https://seu-servidor.com
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="api-key">Chave da API</Label>
          <Input 
            id="api-key" 
            type="password"
            placeholder="Sua chave de API" 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
        </div>
        
        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testando Conexão...
              </>
            ) : "Salvar Configurações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
