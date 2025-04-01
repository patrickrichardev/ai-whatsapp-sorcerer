
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
    const connData = connection.connection_data || {};
    
    try {
      const { evolutionApiUrl, evolutionApiKey } = await getCredentials(credentials);
      
      console.log(`Creating instance with name: ${instanceName}`);
      console.log(`Evolution API URL: ${evolutionApiUrl}`);
      console.log(`Using API Key: ***${evolutionApiKey ? evolutionApiKey.slice(-4) : ''}`);
      
      // Check if instance already exists
      let instanceExists = false;
      try {
        console.log("Checking if instance already exists...");
        const checkInstanceResponse = await callEvolutionAPI(
          evolutionApiUrl,
          `instance/connectionState/${instanceName}`,
          evolutionApiKey,
          'GET'
        );
        
        console.log("Instance check response:", checkInstanceResponse);
        instanceExists = true;
        
        // If instance exists and is already connected
        if (checkInstanceResponse && checkInstanceResponse.state === 'open') {
          await supabaseClient
            .from('agent_connections')
            .update({
              is_active: true,
              connection_data: { 
                ...connData,
                status: 'connected', 
                name: instanceName || 'WhatsApp Instance' 
              }
            })
            .eq('id', connection_id);
          
          return createResponse({ 
            success: true,
            status: 'connected' 
          });
        }
      } catch (error) {
        // If check fails, instance probably doesn't exist, continue with creation
        console.log("Instance doesn't exist, proceeding with creation:", error.message);
        instanceExists = false;
      }

      if (!instanceExists) {
        // Criar instância com a configuração completa
        console.log("Creating new Evolution API instance...");
        
        // Prepare webhook events based on configuration
        const webhookEvents = connData.webhookByEvents ? [
          "MESSAGES_UPSERT",
          "MESSAGES_UPDATE", 
          "CONNECTION_UPDATE"
        ] : [];
        
        // Construct the complete instance creation payload
        const createInstancePayload = {
          instanceName,                     // nome da instância, tipo: conn_abc123
          token: connection_id,             // identificador único, pode usar o próprio connection_id
          qrcode: true,                     // vai gerar o QR Code para parear com o WhatsApp
          integration: 'WHATSAPP-BAILEYS',  // ESSENCIAL: define o tipo de integração
          number: connData.phone || '',     // Número de telefone se fornecido
          
          // Configurações de chamadas
          reject_call: connData.rejectCalls !== undefined ? connData.rejectCalls : true,
          msgCall: connData.rejectCallMessage || "Não posso atender no momento, mas deixe sua mensagem.",
          
          // Configurações gerais
          groupsIgnore: connData.ignoreGroups !== undefined ? connData.ignoreGroups : true,
          alwaysOnline: connData.alwaysOnline !== undefined ? connData.alwaysOnline : true,
          readMessages: connData.readMessages !== undefined ? connData.readMessages : true,
          readStatus: connData.readStatus !== undefined ? connData.readStatus : true,
          syncFullHistory: connData.syncFullHistory !== undefined ? connData.syncFullHistory : true,
          
          // Configurações de webhook
          webhookUrl: connData.webhookUrl || '',
          webhookByEvents: connData.webhookByEvents !== undefined ? connData.webhookByEvents : false,
          webhookBase64: connData.webhookBase64 !== undefined ? connData.webhookBase64 : false,
          webhookEvents: webhookEvents
        };
        
        // Log the payload for debugging
        console.log("Instance creation payload:", JSON.stringify(createInstancePayload, null, 2));
        
        const createInstanceData = await callEvolutionAPI(
          evolutionApiUrl,
          'instance/create',
          evolutionApiKey,
          'POST',
          createInstancePayload
        );

        console.log("Instance creation response:", createInstanceData);
        
        // Delay to allow the instance to initialize properly
        console.log("Waiting for instance initialization...");
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      // Even if the instance exists, try to connect it explicitly
      try {
        console.log(`Explicitly connecting instance: ${instanceName}`);
        await callEvolutionAPI(
          evolutionApiUrl,
          `instance/connect/${instanceName}`,
          evolutionApiKey,
          'POST'
        );
        // Wait for connection to initialize
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.warn(`Warning: Explicit connect call failed: ${error.message}`);
        // Continue anyway, as the instance might already be connected
      }

      // Try get the QR code
      console.log(`Getting QR code for instance: ${instanceName}`);
      
      let qrResponse;
      try {
        qrResponse = await callEvolutionAPI(
          evolutionApiUrl,
          `instance/qrcode/${instanceName}`,
          evolutionApiKey,
          'GET'
        );
        
        console.log("QR code response:", qrResponse);
      } catch (error) {
        console.error("Failed to get QR code:", error);
        qrResponse = null;
      }
      
      if (qrResponse && qrResponse.qrcode) {
        // Remove o prefixo "data:image/png;base64," do QR code se necessário
        const qr = qrResponse.qrcode.split(',')[1] || qrResponse.qrcode;

        // Atualizar o banco de dados com os dados da conexão
        await supabaseClient
          .from('agent_connections')
          .update({
            is_active: false,
            connection_data: { 
              ...connData,
              status: 'awaiting_scan', 
              qr, 
              name: instanceName || 'WhatsApp Instance' 
            }
          })
          .eq('id', connection_id);

        return createResponse({ 
          success: true,
          qr, 
          status: 'awaiting_scan' 
        });
      }

      // Caso não tenha obtido o QR code, verificar o status da conexão
      console.log("No QR code received, checking connection state...");
      let statusResponse;
      try {
        statusResponse = await callEvolutionAPI(
          evolutionApiUrl,
          `instance/connectionState/${instanceName}`,
          evolutionApiKey,
          'GET'
        );
        
        console.log("Connection status response:", statusResponse);
      } catch (error) {
        console.error("Failed to check connection state:", error);
        statusResponse = { state: "unknown" };
      }
      
      if (statusResponse && statusResponse.state === 'open') {
        // Se já estiver conectado, atualizar o status no banco de dados
        await supabaseClient
          .from('agent_connections')
          .update({
            is_active: true,
            connection_data: { 
              ...connData,
              status: 'connected', 
              name: instanceName || 'WhatsApp Instance' 
            }
          })
          .eq('id', connection_id);
          
        return createResponse({ 
          success: true,
          status: 'connected' 
        });
      }

      // Se nem QR nem status conectado, tentar uma última vez obter o QR code
      console.log("Making one final attempt to get QR code...");
      try {
        // Esperar mais um pouco
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        qrResponse = await callEvolutionAPI(
          evolutionApiUrl,
          `instance/qrcode/${instanceName}`,
          evolutionApiKey,
          'GET'
        );
        
        if (qrResponse && qrResponse.qrcode) {
          const qr = qrResponse.qrcode.split(',')[1] || qrResponse.qrcode;
          
          await supabaseClient
            .from('agent_connections')
            .update({
              is_active: false,
              connection_data: { 
                ...connData,
                status: 'awaiting_scan', 
                qr, 
                name: instanceName || 'WhatsApp Instance' 
              }
            })
            .eq('id', connection_id);

          return createResponse({ 
            success: true,
            qr, 
            status: 'awaiting_scan' 
          });
        }
      } catch (error) {
        console.error("Final QR code attempt failed:", error);
      }

      return createResponse({ 
        success: true,
        status: statusResponse?.state || 'unknown',
        details: "Instância criada mas não foi possível obter o QR code. Por favor, tente atualizar."
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
