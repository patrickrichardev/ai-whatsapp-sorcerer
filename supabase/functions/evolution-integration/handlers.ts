
import { corsHeaders, customCredentials } from "./config.ts";
import { getCredentials, createSupabaseClient, createResponse, createErrorResponse } from "./utils.ts";

// Handler for updating credentials
export async function handleUpdateCredentials(credentials?: { apiUrl?: string; apiKey?: string }) {
  if (!credentials || !credentials.apiUrl || !credentials.apiKey) {
    return createResponse({ 
      success: false, 
      error: "Credenciais inválidas" 
    }, 400);
  }
  
  // Store the custom credentials
  customCredentials.apiUrl = credentials.apiUrl;
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
    const response = await fetch(`${evolutionApiUrl}/instance/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      },
      // Use AbortController to set a timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
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
  if (!connection_id) {
    return createErrorResponse('ID da conexão não fornecido', 400);
  }
  
  const instanceName = `conn_${connection_id}`;
  
  try {
    const { evolutionApiUrl, evolutionApiKey } = await getCredentials(credentials);
    
    console.log(`Creating instance with name: ${instanceName}`);
    console.log(`Evolution API URL: ${evolutionApiUrl}`);
    console.log(`Using API Key: ***${evolutionApiKey ? evolutionApiKey.slice(-4) : ''}`);
    
    // Criar instância se não existir
    const createInstanceResponse = await fetch(`${evolutionApiUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      },
      body: JSON.stringify({
        instanceName,
        token: connection_id,
        qrcode: true
      })
    });

    if (!createInstanceResponse.ok) {
      const errorText = await createInstanceResponse.text();
      console.error("Error creating instance:", errorText);
      throw new Error(`Falha ao criar instância: ${errorText}`);
    }

    const createInstanceData = await createInstanceResponse.json();
    console.log("Instance creation response:", createInstanceData);

    // Conectar instância
    console.log(`Connecting to instance: ${instanceName}`);
    const connectResponse = await fetch(`${evolutionApiUrl}/instance/connect/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      }
    });

    if (!connectResponse.ok) {
      const errorText = await connectResponse.text();
      console.error("Error connecting to instance:", errorText);
      throw new Error(`Falha ao conectar à instância: ${errorText}`);
    }

    const connectionData = await connectResponse.json();
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
    const statusResponse = await fetch(`${evolutionApiUrl}/instance/connectionState/${instanceName}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      }
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error("Error checking instance status:", errorText);
      throw new Error(`Falha ao verificar status: ${errorText}`);
    }

    const statusData = await statusResponse.json();
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
    const qrResponse = await fetch(`${evolutionApiUrl}/instance/qrcode/${instanceName}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      }
    });

    if (!qrResponse.ok) {
      const errorText = await qrResponse.text();
      console.error("Error getting QR code:", errorText);
      // Don't throw here, just return the current status
      return createResponse({ 
        success: true,
        status: statusData.state || 'unknown',
        error: `Não foi possível obter QR code: ${errorText}`
      });
    }

    const qrData = await qrResponse.json();
    console.log("QR code data:", qrData);
    
    if (qrData.qrcode) {
      const qr = qrData.qrcode.split(',')[1] || qrData.qrcode;
      return createResponse({ 
        success: true,
        qr, 
        status: 'awaiting_scan' 
      });
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
    
    const sendResponse = await fetch(`${evolutionApiUrl}/message/text/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      },
      body: JSON.stringify({
        number: phone,
        text: message
      })
    });

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      throw new Error(`Falha ao enviar mensagem: ${errorText}`);
    }

    const responseData = await sendResponse.json();
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
    
    const logoutResponse = await fetch(`${evolutionApiUrl}/instance/logout/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      }
    });

    if (!logoutResponse.ok) {
      const errorText = await logoutResponse.text();
      throw new Error(`Falha ao desconectar: ${errorText}`);
    }

    const deleteResponse = await fetch(`${evolutionApiUrl}/instance/delete/${instanceName}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      }
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.warn(`Warning: Could not delete instance: ${errorText}`);
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
