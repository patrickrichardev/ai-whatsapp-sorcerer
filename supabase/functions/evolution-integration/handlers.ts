
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
  customCredentials = {
    apiUrl: credentials.apiUrl,
    apiKey: credentials.apiKey
  };
  
  return createResponse({ 
    success: true, 
    message: "Credenciais atualizadas com sucesso" 
  });
}

// Handler for testing connection
export async function handleTestConnection(credentials?: { apiUrl?: string; apiKey?: string }) {
  try {
    const { evolutionApiUrl, evolutionApiKey } = getCredentials(credentials);
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
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    return createResponse({ 
      success: true, 
      message: "Conexão com a Evolution API estabelecida com sucesso",
      data
    });
  } catch (error) {
    console.error("Erro ao testar conexão:", error);
    
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
  agent_id: string, 
  supabaseClient: any,
  credentials?: { apiUrl?: string; apiKey?: string }
) {
  if (!agent_id) {
    return createErrorResponse('ID do agente não fornecido', 400);
  }
  
  const instanceName = `agent_${agent_id}`;
  const { evolutionApiUrl, evolutionApiKey } = getCredentials(credentials);
  
  try {
    // Criar instância se não existir
    const createInstanceResponse = await fetch(`${evolutionApiUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      },
      body: JSON.stringify({
        instanceName,
        token: agent_id,
        qrcode: true
      })
    });

    if (!createInstanceResponse.ok) {
      throw new Error('Falha ao criar instância');
    }

    // Conectar instância
    const connectResponse = await fetch(`${evolutionApiUrl}/instance/connect/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
      }
    });

    const connectionData = await connectResponse.json();
    
    if (connectionData.qrcode) {
      // Remove o prefixo "data:image/png;base64," do QR code
      const qr = connectionData.qrcode.split(',')[1] || connectionData.qrcode;

      await supabaseClient
        .from('agent_connections')
        .upsert({
          agent_id,
          platform: 'whatsapp',
          is_active: false,
          connection_data: { status: 'awaiting_scan', qr }
        });

      return createResponse({ qr, status: 'awaiting_scan' });
    }

    return createResponse({ status: connectionData.state || 'error' });
  } catch (error) {
    console.error('Erro ao conectar:', error);
    throw error;
  }
}

// Handler for checking status
export async function handleStatus(
  agent_id: string,
  supabaseClient: any,
  credentials?: { apiUrl?: string; apiKey?: string }
) {
  const instanceName = `agent_${agent_id}`;
  const { evolutionApiUrl, evolutionApiKey } = getCredentials(credentials);
  
  const statusResponse = await fetch(`${evolutionApiUrl}/instance/connectionState/${instanceName}`, {
    headers: {
      'Content-Type': 'application/json',
      'apikey': evolutionApiKey
    }
  });

  const statusData = await statusResponse.json();
  
  if (statusData.state === 'open') {
    await supabaseClient
      .from('agent_connections')
      .upsert({
        agent_id,
        platform: 'whatsapp',
        is_active: true,
        connection_data: { status: 'connected' }
      });

    return createResponse({ status: 'connected' });
  }

  // Se não estiver conectado, tenta obter novo QR code
  const qrResponse = await fetch(`${evolutionApiUrl}/instance/qrcode/${instanceName}`, {
    headers: {
      'Content-Type': 'application/json',
      'apikey': evolutionApiKey
    }
  });

  const qrData = await qrResponse.json();
  
  if (qrData.qrcode) {
    const qr = qrData.qrcode.split(',')[1] || qrData.qrcode;
    return createResponse({ qr, status: 'awaiting_scan' });
  }

  return createResponse({ status: statusData.state });
}

// Handler for sending messages
export async function handleSend(
  agent_id: string,
  phone: string,
  message: string,
  credentials?: { apiUrl?: string; apiKey?: string }
) {
  if (!phone) {
    return createErrorResponse('Número de telefone não fornecido', 400);
  }

  const instanceName = `agent_${agent_id}`;
  const { evolutionApiUrl, evolutionApiKey } = getCredentials(credentials);
  
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
    throw new Error('Falha ao enviar mensagem');
  }

  return createResponse({ success: true });
}

// Handler for disconnecting
export async function handleDisconnect(
  agent_id: string,
  supabaseClient: any,
  credentials?: { apiUrl?: string; apiKey?: string }
) {
  const instanceName = `agent_${agent_id}`;
  const { evolutionApiUrl, evolutionApiKey } = getCredentials(credentials);
  
  const logoutResponse = await fetch(`${evolutionApiUrl}/instance/logout/${instanceName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': evolutionApiKey
    }
  });

  if (!logoutResponse.ok) {
    throw new Error('Falha ao desconectar');
  }

  const deleteResponse = await fetch(`${evolutionApiUrl}/instance/delete/${instanceName}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'apikey': evolutionApiKey
    }
  });

  if (!deleteResponse.ok) {
    throw new Error('Falha ao deletar instância');
  }

  await supabaseClient
    .from('agent_connections')
    .upsert({
      agent_id,
      platform: 'whatsapp',
      is_active: false,
      connection_data: { status: 'disconnected' }
    });

  return createResponse({ status: 'disconnected' });
}
