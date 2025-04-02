
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CheckApiConfig() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkConfig = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("check-evolution-config");
      
      if (error) {
        throw new Error(`Erro ao verificar configuração: ${error.message}`);
      }
      
      setConfig(data.config);
    } catch (err: any) {
      console.error("Erro:", err);
      setError(err.message || "Erro desconhecido ao verificar configuração");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConfig();
  }, []);

  return (
    <div className="container py-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Configuração da Evolution API</h1>
      
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Verificando configuração...</span>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 rounded-md bg-red-50 mb-4">
            <p className="font-bold">Erro ao verificar configuração:</p>
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={checkConfig} 
              className="mt-4"
            >
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Configurações atuais:</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">URL da Evolution API:</h3>
                <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto break-all">
                  {config?.evolution_api_url || "Não configurada"}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">API Key (completa):</h3>
                <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto break-all">
                  {config?.evolution_api_key || "Não configurada"}
                </pre>
              </div>
            </div>
            
            <Button 
              onClick={checkConfig} 
              className="mt-6"
              variant="outline"
            >
              Atualizar
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
