
import { corsHeaders, customCredentials } from "./config.ts";
import { getCredentials, createSupabaseClient, createResponse, createErrorResponse, callEvolutionAPI } from "./utils.ts";

// Handler for updating credentials
export async function handleUpdateCredentials(credentials?: { apiUrl?: string; apiKey?: string }) {
  if (!credentials || !credentials.apiUrl || !credentials.apiKey) {
    return createResponse({ 
      success: false, 
      error: "Credenciais inválidas" 
    }, 400);
  }
  
  // Remove /manager if present at the end of the URL
  const cleanApiUrl = credentials.apiUrl.replace(/\/manager$/, '');
  
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
      
      // Criar instância se não existir
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

      // Conectar instância
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
