
import { createResponse, createErrorResponse, callEvolutionAPI, getCredentials } from "../../utils.ts";

// Handler for connecting a WhatsApp instance
export async function handleConnect(
  connection_id: string, 
  supabaseClient: any,
  credentials?: { apiUrl?: string; apiKey?: string }
) {
  try {
    // Buscar informações da conexão
    const { data: connection, error: connectionError } = await supabaseClient
      .from('agent_connections')
      .select('*')
      .eq('id', connection_id)
      .single();
    
    if (connectionError) {
      throw new Error(`Erro ao buscar informações da conexão: ${connectionError.message}`);
    }
    
    if (!connection) {
      throw new Error(`Conexão não encontrada: ${connection_id}`);
    }
    
    // Se a conexão tiver a flag use_default_agent e não tiver agent_id, buscar o primeiro agente disponível
    if (connection.connection_data?.use_default_agent === true && !connection.agent_id) {
      // Buscar um agente para associar
      const { data: agents, error: agentsError } = await supabaseClient
        .from('agents')
        .select('id')
        .limit(1);
      
      if (!agentsError && agents && agents.length > 0) {
        // Atualizar a conexão com o agent_id encontrado
        await supabaseClient
          .from('agent_connections')
          .update({ agent_id: agents[0].id })
          .eq('id', connection_id);
        
        console.log(`Agente ${agents[0].id} associado automaticamente à conexão ${connection_id}`);
      }
    }
    
    const instanceName = `conn_${connection_id}`;
    
    try {
      const { evolutionApiUrl, evolutionApiKey } = await getCredentials(credentials);
      
      console.log(`Creating instance with name: ${instanceName}`);
      console.log(`Evolution API URL: ${evolutionApiUrl}`);
      console.log(`Using API Key: ***${evolutionApiKey ? evolutionApiKey.slice(-4) : ''}`);
      
      // Add debug logs for URL construction
      console.log('[DEBUG] baseUrl:', evolutionApiUrl);
      console.log('[DEBUG] endpoint:', 'instance/create');
      console.log('[DEBUG] Final URL:', `${evolutionApiUrl}/instance/create`);
      
      // Criar instância se não existir - Endpoint correto sem "manager/"
      const createInstanceData = await callEvolutionAPI(
        evolutionApiUrl,
        'instance/create',
        evolutionApiKey,
        'POST',
        {
          instanceName,
          token: connection_id,
          qrcode: true
          type: 'whatsapp'
        }
      );

      console.log("Instance creation response:", createInstanceData);

      // Add debug logs for connect URL
      console.log('[DEBUG] baseUrl:', evolutionApiUrl);
      console.log('[DEBUG] endpoint:', `instance/connect/${instanceName}`);
      console.log('[DEBUG] Final URL:', `${evolutionApiUrl}/instance/connect/${instanceName}`);
      
      // Conectar instância - Endpoint correto sem "manager/"
      console.log(`Connecting to instance: ${instanceName}`);
      const connectionData = await callEvolutionAPI(
        evolutionApiUrl,
        `instance/connect/${instanceName}`,
        evolutionApiKey,
        'POST'
      );

      console.log("Connection response:", connectionData);
      
      if (connectionData.qrcode) {
        // Remove o prefixo "data:image/png;base64," do QR code
        const qr = connectionData.qrcode.split(',')[1] || connectionData.qrcode;

        await supabaseClient
          .from('agent_connections')
          .update({
            is_active: false,
            connection_data: { status: 'awaiting_scan', qr, name: connectionData.instance?.instanceName || 'WhatsApp Instance' }
          })
          .eq('id', connection_id);

        return createResponse({ 
          success: true,
          qr, 
          status: 'awaiting_scan' 
        });
      }

      return createResponse({ 
        success: true,
        status: connectionData.state || 'unknown' 
      });
    } catch (error) {
      console.error('Erro ao conectar:', error);
      return createResponse({
        success: false,
        error: error.message || "Erro desconhecido",
        details: error.toString()
      }, 500);
    }
  } catch (error) {
    console.error('Erro ao conectar:', error);
    return createResponse({
      success: false,
      error: error.message || "Erro desconhecido",
      details: error.toString()
    }, 500);
  }
}
