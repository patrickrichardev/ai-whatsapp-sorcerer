
import { supabase } from "@/lib/supabase";
import { EvolutionAPIResponse } from "./types";

export async function initializeWhatsAppInstance(connectionId: string): Promise<EvolutionAPIResponse> {
  try {
    console.log("Initializing WhatsApp instance for connection:", connectionId);
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "connect", 
        connection_id: connectionId 
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
    
    console.log("Response from Evolution API:", data);
    
    if (!data) {
      return {
        success: false,
        error: "Resposta vazia da API",
        details: "A função retornou uma resposta vazia"
      };
    }
    
    // If data contains an error, pass it along
    if (data.error) {
      return {
        success: false,
        error: data.error,
        details: data.details || "Sem detalhes adicionais"
      };
    }
    
    return data;
  } catch (error: any) {
    console.error("Evolution API Error:", error);
    return {
      success: false,
      error: error.message || "Erro ao conectar com a Evolution API",
      details: error.stack || JSON.stringify(error)
    };
  }
}

export async function checkWhatsAppStatus(connectionId: string): Promise<EvolutionAPIResponse> {
  try {
    console.log("Checking WhatsApp status for connection:", connectionId);
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "status", 
        connection_id: connectionId 
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
    
    console.log("Status response from Evolution API:", data);
    
    if (!data) {
      return {
        success: false,
        error: "Resposta vazia da API",
        details: "A função retornou uma resposta vazia"
      };
    }
    
    return data;
  } catch (error: any) {
    console.error("Evolution API Error:", error);
    return {
      success: false,
      error: error.message || "Erro ao verificar status da conexão",
      details: error.stack || JSON.stringify(error)
    };
  }
}

export async function disconnectWhatsAppInstance(connectionId: string): Promise<EvolutionAPIResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "disconnect", 
        connection_id: connectionId 
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
    console.error("Evolution API Error:", error);
    return {
      success: false,
      error: error.message || "Erro ao desconectar instância",
      details: error.stack || JSON.stringify(error)
    };
  }
}

// Renamed to avoid conflict but still exported for backward compatibility
export async function testEvolutionAPIConnection(): Promise<EvolutionAPIResponse> {
  try {
    console.log("Testing Evolution API connection");
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "test_connection"
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
