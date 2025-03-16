
import { supabase } from "@/lib/supabase"

interface EvolutionAPIResponse {
  success: boolean;
  message?: string;
  qrcode?: string;
  status?: string;
  error?: string;
}

export interface WhatsAppInstance {
  instanceName: string;
  status: string;
  qrcode?: string;
}

export async function initializeWhatsAppInstance(agentId: string): Promise<EvolutionAPIResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "connect", 
        agent_id: agentId 
      }
    })
    
    if (error) throw error
    
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
      error: error.message || "Erro ao conectar com a Evolution API"
    }
  }
}

export async function checkWhatsAppStatus(agentId: string): Promise<EvolutionAPIResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "status", 
        agent_id: agentId 
      }
    })
    
    if (error) throw error
    
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
      error: error.message || "Erro ao verificar status da conexão"
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
      error: error.message || "Erro ao enviar mensagem"
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
      error: error.message || "Erro ao desconectar instância"
    }
  }
}
