
import { supabase } from "@/lib/supabase";
import { EvolutionAPICredentials, EvolutionAPIResponse } from "./types";

// Update API credentials both in local storage and in the edge function
export async function updateEvolutionAPICredentials(credentials: EvolutionAPICredentials): Promise<EvolutionAPIResponse> {
  try {
    // Store credentials in localStorage for the frontend
    localStorage.setItem('evolution_api_credentials', JSON.stringify(credentials));
    
    // Update credentials in the edge function
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
    
    return data;
  } catch (error: any) {
    console.error("Error updating Evolution API credentials:", error);
    return {
      success: false,
      error: error.message || "Erro ao atualizar credenciais",
      details: error.stack || JSON.stringify(error)
    };
  }
}

// Test connection to the Evolution API
export async function testEvolutionAPIConnection(credentials?: EvolutionAPICredentials): Promise<EvolutionAPIResponse> {
  try {
    // If no credentials are provided, try to get them from localStorage
    if (!credentials) {
      const storedCreds = localStorage.getItem('evolution_api_credentials');
      if (storedCreds) {
        credentials = JSON.parse(storedCreds);
      }
    }
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "test_connection", 
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
    
    return data;
  } catch (error: any) {
    console.error("Error testing Evolution API connection:", error);
    return {
      success: false,
      error: error.message || "Erro ao testar conexão",
      details: error.stack || JSON.stringify(error)
    };
  }
}
