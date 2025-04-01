
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
      
      // Criar instância com a nova configuração
      const createInstanceData = await callEvolutionAPI(
        evolutionApiUrl,
        'instance/create',
        evolutionApiKey,
        'POST',
        {
          instanceName,                  // nome da instância, tipo: conn_abc123
          token: connection_id,         // identificador único, pode usar o próprio connection_id
          qrcode: true,                 // vai gerar o QR Code para parear com o WhatsApp
          integration: 'WHATSAPP-BAILEYS', // ESSENCIAL: define o tipo de integração
          reject_call: true,
          msgCall: "Desculpe, não posso atender chamadas no momento.",
          groupsIgnore: true,
          alwaysOnline: true,
          readMessages: true,
          readStatus: true,
          syncFullHistory: true,
          webhookByEvents: false,
          webhook: {
            url: "",
            enabled: false
          }
        }
      );

      console.log("Instance creation response:", createInstanceData);

      // Add debug logs for connect URL
      console.log('[DEBUG] baseUrl:', evolutionApiUrl);
      console.log('[DEBUG] endpoint:', `instance/connect/${instanceName}`);
      console.log('[DEBUG] Final URL:', `${evolutionApiUrl}/instance/connect/${instanceName}`);
      
      // Adicionar uma pausa de 1 segundo para garantir que a instância esteja pronta
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Conectar instância - Endpoint correto sem "manager/"
      console.log(`Connecting to instance: ${instanceName}`);
      try {
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
              connection_data: { 
                status: 'awaiting_scan', 
                qr, 
                name: connectionData.instance?.instanceName || instanceName
              }
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
      } catch (connectionError) {
        console.error("Error connecting to instance:", connectionError);
        
        // Mesmo com erro de conexão, tentamos recuperar o QR Code diretamente
        try {
          console.log("Attempting to fetch QR code directly...");
          
          // Adicionar uma pausa adicional para garantir que o QR code esteja disponível
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const qrData = await callEvolutionAPI(
            evolutionApiUrl,
            `instance/qrcode/${instanceName}`,
            evolutionApiKey
          );
          
          console.log("QR code response:", qrData);
          
          if (qrData.qrcode) {
            // Remove o prefixo "data:image/png;base64," do QR code
            const qr = qrData.qrcode.split(',')[1] || qrData.qrcode;

            await supabaseClient
              .from('agent_connections')
              .update({
                is_active: false,
                connection_data: { 
                  status: 'awaiting_scan', 
                  qr, 
                  name: instanceName
                }
              })
              .eq('id', connection_id);

            return createResponse({ 
              success: true,
              qr, 
              status: 'awaiting_scan' 
            });
          }
        } catch (qrError) {
          console.error("Failed to fetch QR code:", qrError);
          // Continue with the original error handling
        }
        
        // Se chegamos aqui, não conseguimos conectar nem obter QR code
        // Retornamos erro mas ainda dizemos que a instância foi criada
        return createResponse({
          success: true,
          partialSuccess: true,
          error: connectionError.message || "Erro ao conectar à instância, mas a instância foi criada com sucesso",
          details: connectionError.toString(),
          instanceCreated: true,
          instanceName
        });
      }
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
