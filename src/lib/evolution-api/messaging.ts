
import { supabase } from "@/lib/supabase";
import { EvolutionAPIResponse } from "./types";

export async function sendWhatsAppMessage(phone: string, message: string): Promise<EvolutionAPIResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "send", 
        phone, 
        message
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
      error: error.message || "Erro ao enviar mensagem",
      details: error.stack || JSON.stringify(error)
    };
  }
}
