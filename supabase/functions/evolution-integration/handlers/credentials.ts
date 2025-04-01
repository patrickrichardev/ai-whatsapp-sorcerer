
import { corsHeaders, customCredentials } from "../config.ts";
import { getCredentials, createResponse, createErrorResponse, callEvolutionAPI } from "../utils.ts";

// Handler for updating credentials
export async function handleUpdateCredentials(credentials?: { apiUrl?: string; apiKey?: string }) {
  if (!credentials || !credentials.apiUrl || !credentials.apiKey) {
    return createResponse({ 
      success: false, 
      error: "Credenciais inválidas" 
    }, 400);
  }
  
  // Remove trailing slashes if present
  const cleanApiUrl = credentials.apiUrl.replace(/\/+$/, '');
  
  // Store the custom credentials
  customCredentials.apiUrl = cleanApiUrl;
  customCredentials.apiKey = credentials.apiKey;
  
  return createResponse({ 
    success: true, 
    message: "Credenciais atualizadas com sucesso" 
  });
}

// Handler for testing connection
export async function handleTestConnection(credentials?: { apiUrl?: string; apiKey?: string }) {
  try {
    const { evolutionApiUrl, evolutionApiKey } = await getCredentials(credentials);
    console.log(`Using Evolution API URL: ${evolutionApiUrl}`);
    console.log(`Using Evolution API Key: ${evolutionApiKey ? '***' + evolutionApiKey.slice(-4) : 'none'}`);
    
    // Test connection to Evolution API
    const data = await callEvolutionAPI(
      evolutionApiUrl,
      'instance/info',
      evolutionApiKey
    );
    
    return createResponse({ 
      success: true, 
      message: "Conexão com a Evolution API estabelecida com sucesso",
      data
    });
  } catch (error) {
    console.error("Erro ao testar conexão:", error);
    
    const { evolutionApiUrl } = await getCredentials(credentials);
    
    return createResponse({ 
      success: false, 
      error: `Falha ao conectar: ${error.message}`,
      diagnostics: {
        apiUrl: evolutionApiUrl,
        error: error.toString()
      }
    });
  }
}
