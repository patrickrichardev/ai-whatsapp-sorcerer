
import { supabase } from "@/lib/supabase";
import { EvolutionAPICredentials, EvolutionAPIResponse } from "./types";

// Store custom credentials in memory for the session
let customCredentials: EvolutionAPICredentials | null = null;

/**
 * Updates the Evolution API credentials to use for future requests
 */
export function updateEvolutionAPICredentials(credentials: EvolutionAPICredentials): void {
  customCredentials = credentials;
  console.log("Updated Evolution API credentials:", credentials.apiUrl);
}

/**
 * Tests the connection to the Evolution API
 */
export async function testEvolutionAPIConnection(credentials?: EvolutionAPICredentials): Promise<EvolutionAPIResponse> {
  try {
    // Use the provided credentials, or the stored custom credentials, or rely on the edge function's default
    const apiCredentials = credentials || customCredentials || null;
    
    console.log("Testing Evolution API connection");
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "test_connection",
        credentials: apiCredentials
      }
    });
    
    if (error) {
      console.error("Error calling Supabase function:", error);
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
    
    // If using custom credentials that worked, store them
    if (credentials && data.success && !customCredentials) {
      updateEvolutionAPICredentials(credentials);
    }
    
    return data;
  } catch (error: any) {
    console.error("Error testing Evolution API connection:", error);
    return {
      success: false,
      error: error.message || "Erro ao testar conexão com a Evolution API",
      details: error.stack || JSON.stringify(error)
    };
  }
}
