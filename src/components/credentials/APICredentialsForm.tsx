
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { testEvolutionAPIConnection, updateAPICredentials } from "@/lib/evolution-api";
import { toast } from "sonner";
import { EvolutionAPICredentials } from "@/lib/evolution-api";

interface APICredentialsFormProps {
  onSuccess: () => void;
}

export function APICredentialsForm({ onSuccess }: APICredentialsFormProps) {
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiUrl || !apiKey) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First test the connection with the new credentials
      const testResponse = await testEvolutionAPIConnection({ 
        apiUrl, 
        apiKey 
      });
      
      if (!testResponse.success) {
        toast.error("Falha ao conectar com as credenciais fornecidas");
        console.error("Connection test failed:", testResponse);
        setIsSubmitting(false);
        return;
      }
      
      // If connection test is successful, update the credentials
      const updateResponse = await updateAPICredentials({
        apiUrl,
        apiKey
      });
      
      if (updateResponse.success) {
        toast.success("Credenciais atualizadas com sucesso");
        onSuccess();
      } else {
        toast.error("Falha ao atualizar credenciais");
        console.error("Update failed:", updateResponse);
      }
    } catch (error) {
      console.error("Error updating credentials:", error);
      toast.error("Erro ao processar a solicitação");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Atualizar Credenciais da API</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="apiUrl">URL da Evolution API</Label>
            <Input
              id="apiUrl"
              placeholder="https://seu-servidor.com"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="apiKey">Chave da API</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Sua chave de API"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              "Atualizar Credenciais"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
