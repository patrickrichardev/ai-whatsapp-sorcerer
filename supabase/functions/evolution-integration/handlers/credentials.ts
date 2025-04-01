
import { createResponse, createErrorResponse, callEvolutionAPI, getCredentials } from "../utils.ts";

// Update credentials in memory
export async function handleUpdateCredentials(credentials: { apiUrl?: string; apiKey?: string }) {
  try {
    if (!credentials || !credentials.apiUrl || !credentials.apiKey) {
      return createErrorResponse('URL da API e chave de API são obrigatórios', 400);
    }

    // Importar a configuração personalizada
    const { customCredentials } = await import("../config.ts");
    
    // Atualizar as credenciais na memória
    customCredentials.apiUrl = credentials.apiUrl;
    customCredentials.apiKey = credentials.apiKey;

    console.log(`Credenciais atualizadas: URL=${customCredentials.apiUrl}, Key=${customCredentials.apiKey ? '***' + customCredentials.apiKey.slice(-4) : 'não definida'}`);

    return createResponse({ 
      success: true, 
      message: "Credenciais atualizadas com sucesso" 
    });
  } catch (error) {
    console.error('Erro ao atualizar credenciais:', error);
    return createErrorResponse(error.message);
  }
}

// Test connection to the Evolution API
export async function handleTestConnection(credentials?: { apiUrl?: string; apiKey?: string }) {
  try {
    const { evolutionApiUrl, evolutionApiKey } = await getCredentials(credentials);
    
    console.log("Using Evolution API URL:", evolutionApiUrl);
    console.log("Using Evolution API Key:", evolutionApiKey ? '***' + evolutionApiKey.slice(-4) : '');

    // Tenta diferentes endpoints para verificar a conexão
    const endpoints = [
      "instance/info", // Tenta o endpoint principal
      "instance/list", // Tenta listar instâncias como alternativa
      "instance/fetchInstances", // Outra alternativa
      "instance/instances" // Mais uma alternativa
    ];
    
    let lastError = null;
    let diagnostics = {};
    
    // Tenta cada endpoint até encontrar um que funcione
    for (const endpoint of endpoints) {
      try {
        console.log(`Tentando endpoint: ${endpoint}`);
        const response = await callEvolutionAPI(
          evolutionApiUrl,
          endpoint,
          evolutionApiKey,
          'GET'
        );
        
        console.log(`Resposta do endpoint ${endpoint}:`, response);
        
        // Se chegou aqui, a conexão funcionou
        return createResponse({
          success: true,
          message: `Conexão com a Evolution API estabelecida com sucesso via ${endpoint}`,
          endpoint,
          response
        });
      } catch (error) {
        lastError = error;
        diagnostics[endpoint] = error.message;
        console.warn(`Falha no endpoint ${endpoint}:`, error.message);
        // Continue tentando o próximo endpoint
      }
    }
    
    // Nenhum endpoint funcionou
    console.error("Erro ao testar conexão:", lastError);
    return createResponse({
      success: false,
      error: "Não foi possível conectar à Evolution API em nenhum endpoint",
      details: "Verifique se o servidor está online e se as credenciais estão corretas",
      diagnostics
    }, 500);
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return createErrorResponse(error.message);
  }
}
