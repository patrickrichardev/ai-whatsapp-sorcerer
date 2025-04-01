import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configure aqui a URL do seu servidor Evolution API
const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL') || 'http://localhost:8080'
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY') || 'your-api-key'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { action, agent_id, phone, message } = await req.json()
    const instanceName = `agent_${agent_id}`

    switch (action) {
      case 'test': {
        try {
          // Tentar fazer uma requisição simples para o servidor
          const endpoints = [
            "instance/list",
            "instance/fetchInstances",
            "instance/instances",
            "instance/info"
          ];
          
          for (const endpoint of endpoints) {
            try {
              const testResponse = await fetch(`${EVOLUTION_API_URL}/${endpoint}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': EVOLUTION_API_KEY
                }
              });
              
              if (testResponse.ok) {
                console.log(`Teste de conexão bem sucedido via endpoint ${endpoint}`);
                const responseData = await testResponse.json();
                
                return new Response(
                  JSON.stringify({ 
                    success: true,
                    message: `Conexão com o servidor Evolution API estabelecida com sucesso via ${endpoint}`,
                    endpoint,
                    data: responseData
                  }),
                  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
              }
            } catch (endpointError) {
              console.log(`Falha no endpoint ${endpoint}:`, endpointError.message);
              // Continua tentando o próximo endpoint
            }
          }
          
          // Se chegou aqui, nenhum endpoint funcionou
          throw new Error("Nenhum endpoint de teste respondeu corretamente");
        } catch (error) {
          console.error("Erro no teste de conexão:", error);
          return new Response(
            JSON.stringify({ 
              success: false,
              error: `Erro ao conectar com o servidor Evolution API: ${error.message}`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      case 'connect': {
        try {
          // Buscar configurações da conexão
          const { data: connection, error: connectionError } = await supabaseClient
            .from('agent_connections')
            .select('connection_data')
            .eq('id', agent_id)
            .single();
            
          if (connectionError) {
            throw new Error(`Erro ao obter configurações: ${connectionError.message}`);
          }
          
          const connData = connection?.connection_data || {};
          
          // Verificar se a instância já existe
          try {
            console.log(`Verificando se a instância ${instanceName} já existe...`);
            
            const checkStateResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
              }
            });
            
            if (checkStateResponse.ok) {
              const stateData = await checkStateResponse.json();
              console.log(`Estado atual da instância: ${JSON.stringify(stateData)}`);
              
              if (stateData.state === 'open') {
                console.log(`Instância ${instanceName} já está conectada.`);
                
                await supabaseClient
                  .from('agent_connections')
                  .upsert({
                    id: agent_id,
                    platform: 'whatsapp',
                    is_active: true,
                    connection_data: { 
                      ...connData,
                      status: 'connected' 
                    }
                  });
                  
                return new Response(
                  JSON.stringify({ status: 'connected' }),
                  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
              }
              
              // Se existe mas não está conectada, vamos tentar reconectar
              console.log(`Instância ${instanceName} existe mas não está conectada. Tentando reconectar...`);
              
              // Desconectar instância existente primeiro
              await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': EVOLUTION_API_KEY
                }
              });
              
              // Esperar um pouco antes de deletar
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Deletar instância
              await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': EVOLUTION_API_KEY
                }
              });
              
              // Esperar um pouco antes de recriar
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } catch (checkError) {
            console.log(`Instância não existe ou erro ao verificar: ${checkError.message}`);
            // Se não existir, vamos criar normalmente
          }
          
          // Prepare webhook events based on configuration
          const webhookEvents = connData.webhookByEvents ? [
            "MESSAGES_UPSERT",
            "MESSAGES_UPDATE", 
            "CONNECTION_UPDATE"
          ] : [];
          
          // Criar instância com configurações completas
          const createInstancePayload = {
            instanceName,
            token: agent_id,
            qrcode: true,
            integration: connData.integration || 'WHATSAPP-BAILEYS',
            number: connData.phone || phone || '',
            
            // Configurações de chamadas
            reject_call: connData.rejectCalls !== undefined ? connData.rejectCalls : true,
            msgCall: connData.rejectCallMessage || "Não posso atender no momento, mas deixe sua mensagem.",
            
            // Configurações gerais
            groupsIgnore: connData.ignoreGroups !== undefined ? connData.ignoreGroups : true,
            alwaysOnline: connData.alwaysOnline !== undefined ? connData.alwaysOnline : true,
            readMessages: connData.readMessages !== undefined ? connData.readMessages : true,
            readStatus: connData.readStatus !== undefined ? connData.readStatus : true,
            syncFullHistory: connData.syncFullHistory !== undefined ? connData.syncFullHistory : true,
            
            // Configurações de proxy (se fornecidas)
            ...(connData.proxyHost && { proxyHost: connData.proxyHost }),
            ...(connData.proxyPort && { proxyPort: connData.proxyPort }),
            ...(connData.proxyProtocol && { proxyProtocol: connData.proxyProtocol }),
            ...(connData.proxyUsername && { proxyUsername: connData.proxyUsername }),
            ...(connData.proxyPassword && { proxyPassword: connData.proxyPassword }),
            
            // Configurações de webhook
            ...(connData.webhookUrl && { webhookUrl: connData.webhookUrl }),
            webhookByEvents: connData.webhookByEvents !== undefined ? connData.webhookByEvents : false,
            webhookBase64: connData.webhookBase64 !== undefined ? connData.webhookBase64 : false,
            ...(connData.webhookByEvents && { webhookEvents: webhookEvents }),
            
            // Configurações RabbitMQ (se ativas)
            ...(connData.rabbitmqEnabled && { 
              rabbitmqEnabled: true,
              rabbitmqEvents: connData.rabbitmqEvents || ["MESSAGES_UPSERT"]
            }),
            
            // Configurações SQS (se ativas)
            ...(connData.sqsEnabled && { 
              sqsEnabled: true,
              sqsEvents: connData.sqsEvents || ["MESSAGES_UPSERT"]
            }),
            
            // Configurações Chatwoot (se fornecidas)
            ...(connData.chatwootAccountId && { chatwootAccountId: connData.chatwootAccountId }),
            ...(connData.chatwootToken && { chatwootToken: connData.chatwootToken }),
            ...(connData.chatwootUrl && { chatwootUrl: connData.chatwootUrl }),
            ...(connData.chatwootSignMsg !== undefined && { chatwootSignMsg: connData.chatwootSignMsg }),
            ...(connData.chatwootReopenConversation !== undefined && { chatwootReopenConversation: connData.chatwootReopenConversation }),
            ...(connData.chatwootConversationPending !== undefined && { chatwootConversationPending: connData.chatwootConversationPending }),
            ...(connData.chatwootImportContacts !== undefined && { chatwootImportContacts: connData.chatwootImportContacts }),
            ...(connData.chatwootNameInbox && { chatwootNameInbox: connData.chatwootNameInbox }),
            ...(connData.chatwootMergeBrazilContacts !== undefined && { chatwootMergeBrazilContacts: connData.chatwootMergeBrazilContacts }),
            ...(connData.chatwootDaysLimitImportMessages && { chatwootDaysLimitImportMessages: connData.chatwootDaysLimitImportMessages }),
            ...(connData.chatwootOrganization && { chatwootOrganization: connData.chatwootOrganization }),
            ...(connData.chatwootLogo && { chatwootLogo: connData.chatwootLogo }),
            
            // Configurações Typebot (se fornecidas)
            ...(connData.typebotUrl && { typebotUrl: connData.typebotUrl }),
            ...(connData.typebot && { typebot: connData.typebot }),
            ...(connData.typebotExpire && { typebotExpire: connData.typebotExpire }),
            ...(connData.typebotKeywordFinish && { typebotKeywordFinish: connData.typebotKeywordFinish }),
            ...(connData.typebotDelayMessage && { typebotDelayMessage: connData.typebotDelayMessage }),
            ...(connData.typebotUnknownMessage && { typebotUnknownMessage: connData.typebotUnknownMessage }),
            ...(connData.typebotListeningFromMe !== undefined && { typebotListeningFromMe: connData.typebotListeningFromMe })
          };
          
          console.log("Creating instance with config:", JSON.stringify(createInstancePayload, null, 2));
          
          // Adicionando maior timeout para evitar problemas de conexão
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos de timeout
          
          try {
            const createInstanceResponse = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
              },
              body: JSON.stringify(createInstancePayload),
              signal: controller.signal
            });
            
            clearTimeout(timeoutId); // Limpar o timeout
            
            if (!createInstanceResponse.ok) {
              const errorBody = await createInstanceResponse.text();
              console.error(`Erro na criação da instância: ${errorBody}`);
              throw new Error(`Falha ao criar instância: ${errorBody}`);
            }
            
            const createData = await createInstanceResponse.json();
            console.log("Instance creation response:", createData);
          } catch (createError) {
            console.error("Erro ao criar instância:", createError);
            // Continuamos mesmo se houver erro, pois a instância pode ter sido criada mesmo assim
          }

          // Esperar a inicialização
          console.log("Esperando a inicialização da instância...");
          await new Promise(resolve => setTimeout(resolve, 5000));

          // Conectar instância
          console.log(`Conectando instância ${instanceName}...`);
          let connectionData;
          try {
            const connectResponse = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
              }
            });
            
            if (!connectResponse.ok) {
              const errorBody = await connectResponse.text();
              console.warn(`Aviso ao conectar: ${errorBody}`);
              // Continuamos mesmo se houver aviso
            } else {
              connectionData = await connectResponse.json();
              console.log("Connection response:", connectionData);
            }
          } catch (connectError) {
            console.warn(`Aviso ao conectar: ${connectError.message}`);
            // Continuamos mesmo se houver erro na conexão, vamos tentar obter o QR Code
          }
          
          // Esperar um pouco mais para garantir que a instância esteja pronta
          console.log("Esperando mais um pouco para garantir inicialização completa...");
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Obter QR Code ou estado da conexão
          console.log(`Obtendo QR Code para ${instanceName}...`);
          try {
            const qrResponse = await fetch(`${EVOLUTION_API_URL}/instance/qrcode/${instanceName}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
              }
            });
            
            const qrData = await qrResponse.json();
            console.log("QR code response:", qrData);
            
            if (qrData.qrcode) {
              // Remove o prefixo "data:image/png;base64," do QR code
              const qr = qrData.qrcode.split(',')[1] || qrData.qrcode;

              await supabaseClient
                .from('agent_connections')
                .upsert({
                  id: agent_id,
                  platform: 'whatsapp',
                  is_active: false,
                  connection_data: { 
                    ...connData,
                    status: 'awaiting_scan', 
                    qr 
                  }
                });

              return new Response(
                JSON.stringify({ qr, status: 'awaiting_scan' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          } catch (qrError) {
            console.warn(`Aviso ao obter QR code: ${qrError.message}`);
            // Continuamos se houver erro na obtenção do QR Code
          }
          
          // Verificar estado da conexão
          console.log(`Verificando estado da conexão para ${instanceName}...`);
          try {
            const stateResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
              }
            });
            
            const stateData = await stateResponse.json();
            console.log("Connection state response:", stateData);
            
            if (stateData.state === 'open') {
              await supabaseClient
                .from('agent_connections')
                .upsert({
                  id: agent_id,
                  platform: 'whatsapp',
                  is_active: true,
                  connection_data: { 
                    ...connData,
                    status: 'connected' 
                  }
                });

              return new Response(
                JSON.stringify({ status: 'connected' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          } catch (stateError) {
            console.warn(`Aviso ao verificar estado: ${stateError.message}`);
          }
          
          // Se chegamos aqui, é porque não tivemos sucesso em obter QR Code ou confirmar conexão
          // Vamos verificar estado da instância mais uma vez com tempo extra
          console.log("Fazendo última tentativa de verificar estado/QR code após atraso adicional...");
          await new Promise(resolve => setTimeout(resolve, 8000));
          
          // Uma última tentativa de obter QR Code
          try {
            const lastQrResponse = await fetch(`${EVOLUTION_API_URL}/instance/qrcode/${instanceName}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
              }
            });
            
            const lastQrData = await lastQrResponse.json();
            console.log("Final QR attempt response:", lastQrData);
            
            if (lastQrData.qrcode) {
              const qr = lastQrData.qrcode.split(',')[1] || lastQrData.qrcode;

              await supabaseClient
                .from('agent_connections')
                .upsert({
                  id: agent_id,
                  platform: 'whatsapp',
                  is_active: false,
                  connection_data: { 
                    ...connData,
                    status: 'awaiting_scan', 
                    qr 
                  }
                });

              return new Response(
                JSON.stringify({ qr, status: 'awaiting_scan' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          } catch (lastQrError) {
            console.warn(`Aviso na última tentativa de QR code: ${lastQrError.message}`);
          }
          
          // Última tentativa de verificar estado
          try {
            const lastStateResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
              }
            });
            
            const lastStateData = await lastStateResponse.json();
            console.log("Final state check response:", lastStateData);
            
            return new Response(
              JSON.stringify({ 
                status: lastStateData.state || 'unknown',
                details: "Instância criada, mas não foi possível obter QR code. Tente novamente."
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } catch (lastStateError) {
            console.error(`Erro na última verificação de estado: ${lastStateError.message}`);
          }
          
          // Se todas as tentativas falharem
          return new Response(
            JSON.stringify({ 
              status: 'error',
              error: "Não foi possível criar ou verificar a instância. Tente novamente."
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        } catch (error) {
          console.error('Erro ao conectar:', error);
          return new Response(
            JSON.stringify({ 
              status: 'error',
              error: error.message || "Erro desconhecido",
              details: error.toString()
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
      }

      case 'status': {
        const statusResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY
          }
        })

        const statusData = await statusResponse.json()
        
        if (statusData.state === 'open') {
          // Buscar configurações da conexão
          const { data: connection } = await supabaseClient
            .from('agent_connections')
            .select('connection_data')
            .eq('id', agent_id)
            .single();
            
          const connData = connection?.connection_data || {};
          
          await supabaseClient
            .from('agent_connections')
            .upsert({
              agent_id,
              platform: 'whatsapp',
              is_active: true,
              connection_data: { 
                ...connData,
                status: 'connected' 
              }
            })

          return new Response(
            JSON.stringify({ status: 'connected' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Se não estiver conectado, tenta obter novo QR code
        const qrResponse = await fetch(`${EVOLUTION_API_URL}/instance/qrcode/${instanceName}`, {
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY
          }
        })

        const qrData = await qrResponse.json()
        
        if (qrData.qrcode) {
          // Buscar configurações da conexão
          const { data: connection } = await supabaseClient
            .from('agent_connections')
            .select('connection_data')
            .eq('id', agent_id)
            .single();
            
          const connData = connection?.connection_data || {};
          
          const qr = qrData.qrcode.split(',')[1] || qrData.qrcode
          
          await supabaseClient
            .from('agent_connections')
            .upsert({
              agent_id,
              platform: 'whatsapp',
              is_active: false,
              connection_data: { 
                ...connData,
                status: 'awaiting_scan',
                qr 
              }
            })
            
          return new Response(
            JSON.stringify({ qr, status: 'awaiting_scan' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ status: statusData.state }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'send': {
        if (!phone) {
          throw new Error('Número de telefone não fornecido')
        }

        const sendResponse = await fetch(`${EVOLUTION_API_URL}/message/text/${instanceName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY
          },
          body: JSON.stringify({
            number: phone,
            text: message
          })
        })

        if (!sendResponse.ok) {
          throw new Error('Falha ao enviar mensagem')
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'disconnect': {
        const logoutResponse = await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY
          }
        })

        if (!logoutResponse.ok) {
          throw new Error('Falha ao desconectar')
        }

        const deleteResponse = await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY
          }
        })

        if (!deleteResponse.ok) {
          throw new Error('Falha ao deletar instância')
        }

        // Buscar configurações da conexão
        const { data: connection } = await supabaseClient
          .from('agent_connections')
          .select('connection_data')
          .eq('id', agent_id)
          .single();
          
        const connData = connection?.connection_data || {};

        await supabaseClient
          .from('agent_connections')
          .upsert({
            agent_id,
            platform: 'whatsapp',
            is_active: false,
            connection_data: { 
              ...connData,
              status: 'disconnected' 
            }
          })

        return new Response(
          JSON.stringify({ status: 'disconnected' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
