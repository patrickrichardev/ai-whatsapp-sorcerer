
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
      
      // Check if instance already exists
      try {
        const checkInstanceResponse = await callEvolutionAPI(
          evolutionApiUrl,
          `instance/connectionState/${instanceName}`,
          evolutionApiKey,
          'GET'
        );
        
        console.log("Instance check response:", checkInstanceResponse);
        
        // If instance exists and is already connected
        if (checkInstanceResponse && checkInstanceResponse.state === 'open') {
          await supabaseClient
            .from('agent_connections')
            .update({
              is_active: true,
              connection_data: { 
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
      }
      
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
          groupsIgnore: true,
          alwaysOnline: true,
          readMessages: true,
          readStatus: true,
          syncFullHistory: true
        }
      );

      console.log("Instance creation response:", createInstanceData);

      // Add a delay before requesting the QR code to allow the instance to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try get the QR code
      console.log(`Getting QR code for instance: ${instanceName}`);
      
      const qrResponse = await callEvolutionAPI(
        evolutionApiUrl,
        `instance/qrcode/${instanceName}`,
        evolutionApiKey,
        'GET'
      );
      
      console.log("QR code response:", qrResponse);
      
      if (qrResponse && qrResponse.qrcode) {
        // Remove o prefixo "data:image/png;base64," do QR code se necessário
        const qr = qrResponse.qrcode.split(',')[1] || qrResponse.qrcode;

        // Atualizar o banco de dados com os dados da conexão
        await supabaseClient
          .from('agent_connections')
          .update({
            is_active: false,
            connection_data: { 
              status: 'awaiting_scan', 
              qr, 
              name: createInstanceData.instance?.instanceName || 'WhatsApp Instance' 
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
      const statusResponse = await callEvolutionAPI(
        evolutionApiUrl,
        `instance/connectionState/${instanceName}`,
        evolutionApiKey,
        'GET'
      );
      
      console.log("Connection status response:", statusResponse);
      
      if (statusResponse && statusResponse.state === 'open') {
        // Se já estiver conectado, atualizar o status no banco de dados
        await supabaseClient
          .from('agent_connections')
          .update({
            is_active: true,
            connection_data: { status: 'connected', name: createInstanceData.instance?.instanceName || 'WhatsApp Instance' }
          })
          .eq('id', connection_id);
          
        return createResponse({ 
          success: true,
          status: 'connected' 
        });
      }

      return createResponse({ 
        success: true,
        status: statusResponse?.state || 'unknown',
        details: "Não foi possível obter o QR code ou status de conexão"
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
