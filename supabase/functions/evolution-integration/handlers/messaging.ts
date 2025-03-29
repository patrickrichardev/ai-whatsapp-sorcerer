
import { createResponse, createErrorResponse, callEvolutionAPI, getCredentials } from "../utils.ts";

// Handler for sending messages
export async function handleSend(
  connection_id: string,
  phone: string,
  message: string,
  credentials?: { apiUrl?: string; apiKey?: string }
) {
  if (!phone) {
    return createErrorResponse('Número de telefone não fornecido', 400);
  }

  try {
    const instanceName = `conn_${connection_id}`;
    const { evolutionApiUrl, evolutionApiKey } = await getCredentials(credentials);
    
    console.log(`Enviando mensagem para ${phone} via instância ${instanceName}`);
    
    // Endpoint sem "manager/"
    const responseData = await callEvolutionAPI(
      evolutionApiUrl,
      `message/text/${instanceName}`,
      evolutionApiKey,
      'POST',
      {
        number: phone,
        text: message
      }
    );

    return createResponse({ 
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return createResponse({
      success: false,
      error: error.message || "Erro desconhecido",
      details: error.toString()
    }, 500);
  }
}
