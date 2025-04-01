
import { supabase } from "@/lib/supabase";
import { EvolutionAPIResponse } from "./types";

export async function initializeWhatsAppInstance(connectionId: string): Promise<EvolutionAPIResponse> {
  try {
    console.log("Initializing WhatsApp instance for connection:", connectionId);
    
    // Usar timeout mais longo para evitar problemas com operações demoradas
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos
    
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-connection", {
        body: { 
          action: "connect", 
          agent_id: connectionId 
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
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
      
      return {
        success: true,
        ...data
      };
    } catch (abortError: any) {
      clearTimeout(timeoutId);
      if (abortError.name === 'AbortError') {
        console.error("Request timed out after 60 seconds");
        return {
          success: false,
          error: "A solicitação excedeu o tempo limite de 60 segundos",
          details: "Tente novamente ou verifique se o servidor Evolution API está sobrecarregado"
        };
      }
      throw abortError;
    }
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
    
    // Usar timeout mais curto para verificações de status
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
    
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-connection", {
        body: { 
          action: "status", 
          agent_id: connectionId 
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
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
      
      return {
        success: true,
        ...data
      };
    } catch (abortError: any) {
      clearTimeout(timeoutId);
      if (abortError.name === 'AbortError') {
        console.error("Status check timed out after 30 seconds");
        return {
          success: false,
          error: "A verificação de status excedeu o tempo limite de 30 segundos",
          details: "Tente novamente ou verifique se o servidor Evolution API está sobrecarregado"
        };
      }
      throw abortError;
    }
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
    console.log("Disconnecting WhatsApp instance for connection:", connectionId);
    
    const { data, error } = await supabase.functions.invoke("whatsapp-connection", {
      body: { 
        action: "disconnect", 
        agent_id: connectionId 
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
    
    console.log("Disconnect response:", data);
    
    return {
      success: true,
      ...data
    };
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
    
    // Tentar obter informações básicas do servidor como teste
    try {
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
      
      if (data.error) {
        return {
          success: false,
          error: data.error,
          details: data.details || "Sem detalhes adicionais"
        };
      }
      
      return {
        success: true,
        ...data
      };
    } catch (error) {
      // Se falhar, tentar no endpoint whatsapp-connection como fallback
      console.log("Evolution-integration failed, trying whatsapp-connection directly...");
      
      // Tentar uma verificação simples pelo endpoint de fallback
      const { data, error } = await supabase.functions.invoke("whatsapp-connection", {
        body: { 
          action: "test",
          agent_id: "test"
        }
      });
      
      // Se houver erro na chamada, não significa que o servidor não está funcionando,
      // apenas que o endpoint específico falhou
      if (data && !data.error) {
        return {
          success: true,
          message: "Conexão com Evolution API estabelecida com sucesso"
        };
      }
      
      throw new Error("Não foi possível estabelecer conexão com o servidor Evolution API");
    }
  } catch (error: any) {
    console.error("Evolution API Connection Test Error:", error);
    return {
      success: false,
      error: error.message || "Erro ao testar conexão com a Evolution API",
      details: error.stack || JSON.stringify(error)
    };
  }
}
