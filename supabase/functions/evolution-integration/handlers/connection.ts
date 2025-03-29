
import { createResponse, createErrorResponse, callEvolutionAPI, getCredentials } from "../utils.ts";

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

// Handler for checking status
export async function handleStatus(
  connection_id: string,
  supabaseClient: any,
  credentials?: { apiUrl?: string; apiKey?: string }
) {
  try {
    const instanceName = `conn_${connection_id}`;
    const { evolutionApiUrl, evolutionApiKey } = await getCredentials(credentials);
    
    console.log(`Checking status for instance: ${instanceName}`);
    
    // Add debug logs for status URL
    console.log('[DEBUG] baseUrl:', evolutionApiUrl);
    console.log('[DEBUG] endpoint:', `instance/connectionState/${instanceName}`);
    console.log('[DEBUG] Final URL:', `${evolutionApiUrl}/instance/connectionState/${instanceName}`);
    
    // Endpoint correto sem "manager/"
    const statusData = await callEvolutionAPI(
      evolutionApiUrl,
      `instance/connectionState/${instanceName}`,
      evolutionApiKey
    );
    
    console.log("Status data:", statusData);
    
    if (statusData.state === 'open') {
      await supabaseClient
        .from('agent_connections')
        .update({
          is_active: true,
          connection_data: { status: 'connected' }
        })
        .eq('id', connection_id);

      return createResponse({ 
        success: true,
        status: 'connected' 
      });
    }

    // Se não estiver conectado, tenta obter novo QR code
    console.log(`Getting QR code for instance: ${instanceName}`);
    
    try {
      // Add debug logs for QR code URL
      console.log('[DEBUG] baseUrl:', evolutionApiUrl);
      console.log('[DEBUG] endpoint:', `instance/qrcode/${instanceName}`);
      console.log('[DEBUG] Final URL:', `${evolutionApiUrl}/instance/qrcode/${instanceName}`);
      
      // Endpoint correto sem "manager/"
      const qrData = await callEvolutionAPI(
        evolutionApiUrl,
        `instance/qrcode/${instanceName}`,
        evolutionApiKey
      );
      
      console.log("QR code data:", qrData);
      
      if (qrData.qrcode) {
        const qr = qrData.qrcode.split(',')[1] || qrData.qrcode;
        return createResponse({ 
          success: true,
          qr, 
          status: 'awaiting_scan' 
        });
      }
    } catch (qrError) {
      console.warn("Could not get QR code:", qrError);
      // Continue with current status
    }

    return createResponse({ 
      success: true,
      status: statusData.state || 'unknown' 
    });
  } catch (error) {
    console.error("Error in status check:", error);
    return createResponse({
      success: false,
      error: error.message || "Erro desconhecido",
      details: error.toString()
    }, 500);
  }
}

// Handler for disconnecting
export async function handleDisconnect(
  connection_id: string,
  supabaseClient: any,
  credentials?: { apiUrl?: string; apiKey?: string }
) {
  try {
    const instanceName = `conn_${connection_id}`;
    const { evolutionApiUrl, evolutionApiKey } = await getCredentials(credentials);
    
    try {
      // Add debug logs for logout URL
      console.log('[DEBUG] baseUrl:', evolutionApiUrl);
      console.log('[DEBUG] endpoint:', `instance/logout/${instanceName}`);
      console.log('[DEBUG] Final URL:', `${evolutionApiUrl}/instance/logout/${instanceName}`);
      
      // Endpoint correto sem "manager/"
      await callEvolutionAPI(
        evolutionApiUrl,
        `instance/logout/${instanceName}`,
        evolutionApiKey,
        'POST'
      );
    } catch (logoutError) {
      console.warn(`Warning: Logout failed: ${logoutError.message}`);
      // Continue with deletion even if logout failed
    }

    try {
      // Add debug logs for delete URL
      console.log('[DEBUG] baseUrl:', evolutionApiUrl);
      console.log('[DEBUG] endpoint:', `instance/delete/${instanceName}`);
      console.log('[DEBUG] Final URL:', `${evolutionApiUrl}/instance/delete/${instanceName}`);
      
      // Endpoint correto sem "manager/"
      await callEvolutionAPI(
        evolutionApiUrl,
        `instance/delete/${instanceName}`,
        evolutionApiKey,
        'DELETE'
      );
    } catch (deleteError) {
      console.warn(`Warning: Delete instance failed: ${deleteError.message}`);
      // Continue with the process even if deletion failed
    }

    await supabaseClient
      .from('agent_connections')
      .update({
        is_active: false,
        connection_data: { status: 'disconnected' }
      })
      .eq('id', connection_id);

    return createResponse({ 
      success: true,
      status: 'disconnected' 
    });
  } catch (error) {
    return createResponse({
      success: false,
      error: error.message || "Erro desconhecido",
      details: error.toString()
    }, 500);
  }
}
