
import { supabase } from "@/lib/supabase";
import { EvolutionAPIResponse } from "./types";

export async function initializeWhatsAppInstance(agentId: string): Promise<EvolutionAPIResponse> {
  try {
    console.log("Initializing WhatsApp instance for agent:", agentId);
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "connect", 
        agent_id: agentId 
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

export async function checkWhatsAppStatus(agentId: string): Promise<EvolutionAPIResponse> {
  try {
    console.log("Checking WhatsApp status for agent:", agentId);
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "status", 
        agent_id: agentId 
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

export async function disconnectWhatsAppInstance(agentId: string): Promise<EvolutionAPIResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "disconnect", 
        agent_id: agentId 
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
