
import { supabase } from "@/lib/supabase"

interface EvolutionAPIResponse {
  success: boolean;
  message?: string;
  qrcode?: string;
  status?: string;
  error?: string;
  details?: string;
}

export interface WhatsAppInstance {
  instanceName: string;
  status: string;
  qrcode?: string;
}

export async function initializeWhatsAppInstance(agentId: string): Promise<EvolutionAPIResponse> {
  try {
    console.log("Initializing WhatsApp instance for agent:", agentId)
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "connect", 
        agent_id: agentId 
      }
    })
    
    if (error) {
      console.error("Supabase function error:", error)
      throw error
    }
    
    console.log("Response from Evolution API:", data)
    
    // Transformar o qr em qrcode para manter compatibilidade
    if (data.qr) {
      return {
        success: true,
        qrcode: data.qr,
        status: data.status
      }
    }
    
    // Verificar se temos uma resposta completa
    if (!data || (data && !data.success && !data.status && !data.qr && !data.error)) {
      console.error("Invalid response from Evolution API:", data)
      return {
        success: false,
        error: "Resposta inválida da API",
        details: JSON.stringify(data)
      }
    }
    
    return data
  } catch (error: any) {
    console.error("Evolution API Error:", error)
    return {
      success: false,
      error: error.message || "Erro ao conectar com a Evolution API",
      details: error.stack || JSON.stringify(error)
    }
  }
}

export async function checkWhatsAppStatus(agentId: string): Promise<EvolutionAPIResponse> {
  try {
    console.log("Checking WhatsApp status for agent:", agentId)
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "status", 
        agent_id: agentId 
      }
    })
    
    if (error) {
      console.error("Supabase function error:", error)
      throw error
    }
    
    console.log("Status response from Evolution API:", data)
    
    // Transformar o qr em qrcode para manter compatibilidade
    if (data.qr) {
      return {
        success: true,
        qrcode: data.qr,
        status: data.status
      }
    }
    
    return data
  } catch (error: any) {
    console.error("Evolution API Error:", error)
    return {
      success: false,
      error: error.message || "Erro ao verificar status da conexão",
      details: error.stack || JSON.stringify(error)
    }
  }
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<EvolutionAPIResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "send", 
        phone, 
        message
      }
    })
    
    if (error) throw error
    return data
  } catch (error: any) {
    console.error("Evolution API Error:", error)
    return {
      success: false,
      error: error.message || "Erro ao enviar mensagem",
      details: error.stack || JSON.stringify(error)
    }
  }
}

export async function disconnectWhatsAppInstance(agentId: string): Promise<EvolutionAPIResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "disconnect", 
        agent_id: agentId 
      }
    })
    
    if (error) throw error
    return data
  } catch (error: any) {
    console.error("Evolution API Error:", error)
    return {
      success: false,
      error: error.message || "Erro ao desconectar instância",
      details: error.stack || JSON.stringify(error)
    }
  }
}
