
import { supabase } from "@/lib/supabase";
import { EvolutionAPIResponse, EvolutionAPICredentials } from "./types";

/**
 * Updates the credentials for the Evolution API
 */
export async function updateEvolutionAPICredentials(credentials: EvolutionAPICredentials): Promise<EvolutionAPIResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "update_credentials", 
        credentials: {
          apiUrl: credentials.apiUrl,
          apiKey: credentials.apiKey
        }
      }
    });
    
    if (error) {
      return {
        success: false,
        error: `Erro na função do Supabase: ${error.message}`,
        details: JSON.stringify(error)
      };
    }
    
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao atualizar credenciais",
      details: error.stack || JSON.stringify(error)
    };
  }
}

/**
 * Tests connection to the Evolution API server
 */
export async function testEvolutionAPIConnection(credentials?: EvolutionAPICredentials): Promise<EvolutionAPIResponse> {
  try {
    const body: any = { 
      action: "test_connection" 
    };
    
    if (credentials) {
      body.credentials = {
        apiUrl: credentials.apiUrl,
        apiKey: credentials.apiKey
      };
    }
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body
    });
    
    if (error) {
      return {
        success: false,
        error: `Erro na função do Supabase: ${error.message}`,
        details: JSON.stringify(error)
      };
    }
    
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erro ao testar conexão",
      details: error.stack || JSON.stringify(error)
    };
  }
}
