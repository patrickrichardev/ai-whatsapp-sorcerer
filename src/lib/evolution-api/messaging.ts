
import { supabase } from "@/lib/supabase";
import { EvolutionAPIResponse } from "./types";

/**
 * Envia uma mensagem de texto via WhatsApp usando a Evolution API
 * 
 * @param connectionId - ID da conexão do WhatsApp
 * @param phone - Número do telefone de destino (formato: CÓDIGO_DO_PAÍS + DDD + NÚMERO, Ex: 5511999999999)
 * @param message - Conteúdo da mensagem a ser enviada
 * @returns Resposta da API com status de sucesso ou erro
 */
export async function sendWhatsAppMessage(
  connectionId: string, 
  phone: string, 
  message: string
): Promise<EvolutionAPIResponse> {
  try {
    console.log(`Enviando mensagem para ${phone} via conexão ${connectionId}`);
    
    // Formata o número de telefone se necessário
    const formattedPhone = formatPhoneNumber(phone);
    
    const { data, error } = await supabase.functions.invoke("evolution-integration", {
      body: { 
        action: "send", 
        connection_id: connectionId,
        phone: formattedPhone,
        message
      }
    });
    
    if (error) {
      console.error("Erro na função do Supabase:", error);
      return {
        success: false,
        error: `Erro na função do Supabase: ${error.message}`,
        details: JSON.stringify(error)
      };
    }
    
    console.log("Resposta do envio de mensagem:", data);
    
    if (!data) {
      return {
        success: false,
        error: "Resposta vazia da API",
        details: "A função retornou uma resposta vazia"
      };
    }
    
    return data;
  } catch (error: any) {
    console.error("Erro ao enviar mensagem WhatsApp:", error);
    return {
      success: false,
      error: error.message || "Erro ao enviar mensagem",
      details: error.stack || JSON.stringify(error)
    };
  }
}

/**
 * Formata o número de telefone para o padrão aceito pela API
 * Remove caracteres especiais e adiciona o código do país se necessário
 */
function formatPhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  let formattedPhone = phone.replace(/\D/g, '');
  
  // Se o número não começar com '55' (código do Brasil) e tiver menos de 13 dígitos,
  // assume que é um número brasileiro e adiciona o código do país
  if (!formattedPhone.startsWith('55') && formattedPhone.length < 13) {
    formattedPhone = `55${formattedPhone}`;
  }
  
  return formattedPhone;
}
