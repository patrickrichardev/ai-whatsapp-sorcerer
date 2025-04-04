
import { supabase } from "@/lib/supabase";
import { EvolutionAPIResponse } from "./types";

export async function updateEvolutionAPICredentials(apiUrl: string, apiKey: string): Promise<EvolutionAPIResponse> {
  try {
    console.log("Updating Evolution API credentials");
    
    // Clean the URL - remove trailing slashes
    const formattedApiUrl = apiUrl.replace(/\/+$/, '');
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "update_credentials",
        credentials: {
          apiUrl: formattedApiUrl, 
          apiKey
        } 
      }
    });
    
    if (error) {
      console.error("Error updating credentials:", error);
      return {
        success: false,
        error: `Erro ao atualizar credenciais: ${error.message}`,
        details: JSON.stringify(error)
      };
    }
    
    return data;
  } catch (error: any) {
    console.error("Evolution API Error:", error);
    return {
      success: false,
      error: error.message || "Erro ao atualizar credenciais",
      details: error.stack || JSON.stringify(error)
    };
  }
}

export async function testEvolutionAPIConnection(credentials?: { apiUrl?: string; apiKey?: string }): Promise<EvolutionAPIResponse> {
  try {
    console.log("Testing Evolution API connection", credentials ? "with custom credentials" : "with default credentials");
    
    let requestBody: any = { action: "test_connection" };
    
    // Add credentials to request if provided
    if (credentials?.apiUrl && credentials?.apiKey) {
      // Clean the URL - remove trailing slashes
      const formattedApiUrl = credentials.apiUrl.replace(/\/+$/, '');
      
      requestBody.credentials = {
        apiUrl: formattedApiUrl,
        apiKey: credentials.apiKey
      };
    }
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: requestBody
    });
    
    if (error) {
      console.error("Supabase function error:", error);
      return {
        success: false,
        error: `Erro na função do Supabase: ${error.message}`,
        details: JSON.stringify(error)
      };
    }
    
    console.log("Test connection response:", data);
    
    if (!data) {
      return {
        success: false,
        error: "Resposta vazia da API",
        details: "A função retornou uma resposta vazia"
      };
    }
    
    return data;
  } catch (error: any) {
    console.error("Evolution API Connection Test Error:", error);
    return {
      success: false,
      error: error.message || "Erro ao testar conexão com a Evolution API",
      details: error.stack || JSON.stringify(error)
    };
  }
}
