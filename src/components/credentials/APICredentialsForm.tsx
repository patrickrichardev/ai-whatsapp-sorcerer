
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { testEvolutionAPIConnection, updateEvolutionAPICredentials } from "@/lib/evolution-api/connection";
import { toast } from "sonner";

interface APICredentialsFormProps {
  onSuccess: () => void;
}

export function APICredentialsForm({ onSuccess }: APICredentialsFormProps) {
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiUrl || !apiKey) {
      toast.error("Por favor, forneça a URL da API e a chave de API");
      return;
    }
    
    setIsLoading(true);
    try {
      // Remover /manager se tiver no final da URL
      const cleanUrl = apiUrl.replace(/\/manager$/, '');
      
      const updateResult = await updateEvolutionAPICredentials(cleanUrl, apiKey);
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || "Erro ao atualizar credenciais");
      }
      
      // Teste a conexão com as novas credenciais
      const testResult = await testEvolutionAPIConnection({ apiUrl: cleanUrl, apiKey });
      
      if (!testResult.success) {
        throw new Error(testResult.error || "Falha ao testar a conexão");
      }
      
      toast.success("Credenciais atualizadas com sucesso");
      onSuccess();
    } catch (error: any) {
      console.error("Error setting credentials:", error);
      toast.error(`Falha ao configurar API: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-url">URL da Evolution API</Label>
          <Input
            id="api-url"
            placeholder="https://sua-evolution-api.com"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            URL da sua instância da Evolution API (sem /manager no final)
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="api-key">Chave da API</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Sua chave da API"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Chave de autenticação para sua API
          </p>
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Conectando...
          </>
        ) : "Salvar Configurações"}
      </Button>
    </form>
  );
}
