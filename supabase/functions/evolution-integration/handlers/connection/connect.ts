
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
      
      // Criar instância com a configuração simplificada
      const createInstanceData = await callEvolutionAPI(
        evolutionApiUrl,
        'instance/create',
        evolutionApiKey,
        'POST',
        {
          instanceName,
          token: connection_id,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS'
        }
      );

      console.log("Instance creation response:", createInstanceData);

      // Se a instância foi criada com sucesso, tentamos conectar
      if (createInstanceData && !createInstanceData.error) {
        try {
          // Adicionar uma pausa pequena para garantir que a instância esteja registrada
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Conectar à instância - utilizando o formato correto conforme o payload fornecido
          console.log(`Connecting to instance: ${instanceName}`);
          const connect = await callEvolutionAPI(
            evolutionApiUrl,
            `instance/connect/${instanceName}`,
            evolutionApiKey,
            'POST'
          );

          console.log("Connection response:", connect);
          
          if (connect.qrcode) {
            // Remove o prefixo "data:image/png;base64," do QR code se existir
            const qr = connect.qrcode.split(',')[1] || connect.qrcode;

            await supabaseClient
              .from('agent_connections')
              .update({
                is_active: false,
                connection_data: { 
                  status: 'awaiting_scan', 
                  qr, 
                  name: connect.instance?.instanceName || instanceName
                }
              })
              .eq('id', connection_id);

            return createResponse({ 
              success: true,
              qr, 
              status: 'awaiting_scan' 
            });
          }

          // Se chegamos aqui mas não temos QR code, tentamos obter o QR code diretamente
          return await fetchQRCodeDirectly(
            evolutionApiUrl,
            evolutionApiKey,
            instanceName,
            connection_id,
            supabaseClient,
            createInstanceData
          );
        } catch (connectionError) {
          console.error("Error connecting to instance:", connectionError);
          
          // Se falhar ao conectar, ainda tentamos obter o QR code
          return await fetchQRCodeDirectly(
            evolutionApiUrl,
            evolutionApiKey,
            instanceName,
            connection_id,
            supabaseClient,
            createInstanceData
          );
        }
      } else {
        // Se houver erro na criação da instância
        console.error("Error creating instance:", createInstanceData?.error || "Unknown error");
        return createResponse({
          success: false,
          error: createInstanceData?.error || "Erro ao criar instância no Evolution API",
          details: createInstanceData?.details || JSON.stringify(createInstanceData)
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
  } catch (error) {
    console.error('Erro ao conectar:', error);
    return createResponse({
      success: false,
      error: error.message || "Erro desconhecido",
      details: error.toString()
    }, 500);
  }
}

// Função auxiliar para tentar obter o QR code diretamente após a criação da instância
async function fetchQRCodeDirectly(
  evolutionApiUrl: string,
  evolutionApiKey: string,
  instanceName: string,
  connection_id: string,
  supabaseClient: any,
  createInstanceData: any
) {
  console.log("Attempting to fetch QR code directly...");
  
  try {
    // Adicionar uma pausa para dar tempo da instância estar pronta
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
    
    // Se chegamos aqui, a instância foi criada mas não conseguimos obter o QR code ainda
    // Retornamos sucesso parcial para que o cliente possa tentar novamente
    return createResponse({
      success: true,
      partialSuccess: true,
      status: 'pending',
      instanceCreated: true,
      instanceName,
      message: "Instância criada mas aguardando QR code. Tente novamente em alguns segundos."
    });
  } catch (qrError) {
    console.error("Failed to fetch QR code:", qrError);
    
    // Ainda retornamos que a instância foi criada, mesmo sem o QR code
    return createResponse({
      success: true,
      partialSuccess: true,
      error: "Não foi possível obter o QR code no momento",
      details: qrError.toString(),
      instanceCreated: true,
      instanceName,
      status: 'pending'
    });
  }
}
