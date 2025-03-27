
import { supabase } from "@/lib/supabase";
import { EvolutionAPIResponse, EvolutionAPICredentials } from "./types";

export async function testEvolutionAPIConnection(credentials?: {
  apiUrl?: string;
  apiKey?: string;
}): Promise<EvolutionAPIResponse> {
  try {
    console.log("Testing Evolution API connection", credentials ? "with custom credentials" : "with default credentials");
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "test_connection",
        ...(credentials && { credentials })
      }
    });
    
    if (error) {
      console.error("Supabase function error:", error);
      return {
        success: false,
        error: `Erro na função do Supabase: ${error.message}`,
        details: JSON.stringify(error)
      };
    }
    
    console.log("Connection test response:", data);
    
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

export async function updateAPICredentials(credentials: EvolutionAPICredentials): Promise<EvolutionAPIResponse> {
  try {
    console.log("Updating Evolution API credentials");
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "update_credentials",
        credentials
      }
    });
    
    if (error) {
      console.error("Supabase function error:", error);
      return {
        success: false,
        error: `Erro na função do Supabase: ${error.message}`,
        details: JSON.stringify(error)
      };
    }
    
    console.log("Credentials update response:", data);
    
    if (!data) {
      return {
        success: false,
        error: "Resposta vazia da API",
        details: "A função retornou uma resposta vazia"
      };
    }
    
    return data;
  } catch (error: any) {
    console.error("Evolution API Credentials Update Error:", error);
    return {
      success: false,
      error: error.message || "Erro ao atualizar credenciais da Evolution API",
      details: error.stack || JSON.stringify(error)
    };
  }
}
