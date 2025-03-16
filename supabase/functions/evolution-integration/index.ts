
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

// Configuração de cabeçalhos CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configure aqui a URL do seu servidor Evolution API
const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL') || 'https://evolutionapi-evolution-api.nqfltx.easypanel.host'
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY') || '429683C4C977415CAAFCCE10F7D57E11'

console.log(`Usando EVOLUTION_API_URL: ${EVOLUTION_API_URL}`)
console.log(`Usando EVOLUTION_API_KEY: ${EVOLUTION_API_KEY.substring(0, 5)}...`)

serve(async (req) => {
  // Tratamento de requisições OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Inicializa cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Obtém dados da requisição
    const requestData = await req.json()
    const { action, agent_id, phone, message } = requestData
    console.log(`Processando action: ${action}, agent_id: ${agent_id}`)

    if (!agent_id && action !== 'send') {
      return new Response(
        JSON.stringify({ success: false, error: "ID do agente não fornecido" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Nome da instância baseado no ID do agente
    const instanceName = `agent_${agent_id}`

    // Funções auxiliares para lidar com as chamadas à Evolution API
    async function fetchWithErrorHandling(url, options = {}) {
      console.log(`Enviando requisição para: ${url}`)
      
      try {
        // Adiciona timeout para evitar requisições pendentes infinitas
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: A requisição excedeu o tempo limite de 10 segundos')), 10000)
        );
        
        const fetchPromise = fetch(url, options);
        
        // Race entre o fetch e o timeout
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        // Registra o status da resposta
        console.log(`Resposta recebida com status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
        }
        
        // Tenta processar como JSON
        const text = await response.text();
        
        // Verifica se o texto é HTML
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          throw new Error("A resposta recebida é HTML e não JSON. Verifique a URL da API.");
        }
        
        try {
          return { success: true, data: JSON.parse(text) };
        } catch (e) {
          console.log(`Resposta não-JSON recebida: ${text.substring(0, 200)}...`);
          throw new Error(`Não foi possível processar a resposta como JSON: ${e.message}`);
        }
      } catch (error) {
        console.error(`Erro na requisição: ${error.message}`);
        return { 
          success: false, 
          error: error.message,
          details: `URL: ${url}, Método: ${options.method || 'GET'}`
        };
      }
    }

    async function createInstance() {
      console.log(`Criando instância: ${instanceName}`);
      
      return await fetchWithErrorHandling(`${EVOLUTION_API_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          instanceName,
          token: agent_id,
          qrcode: true
        })
      });
    }

    async function connectInstance() {
      console.log(`Conectando instância: ${instanceName}`);
      
      return await fetchWithErrorHandling(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        }
      });
    }

    async function checkInstanceStatus() {
      console.log(`Verificando status da instância: ${instanceName}`);
      
      return await fetchWithErrorHandling(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        }
      });
    }

    async function getQRCode() {
      console.log(`Obtendo QR code da instância: ${instanceName}`);
      
      return await fetchWithErrorHandling(`${EVOLUTION_API_URL}/instance/qrcode/${instanceName}`, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        }
      });
    }

    // Processar a ação solicitada
    switch (action) {
      case 'connect': {
        try {
          // Tentar criar a instância
          const createInstanceResult = await createInstance()
          if (!createInstanceResult.success) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: createInstanceResult.error,
                details: createInstanceResult.details
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
          }

          // Tenta conectar a instância
          const connectResult = await connectInstance()
          if (!connectResult.success) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: connectResult.error,
                details: connectResult.details
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
          }

          const connectionData = connectResult.data
          
          if (connectionData.qrcode) {
            // Remove o prefixo "data:image/png;base64," do QR code
            const qr = connectionData.qrcode.split(',')[1] || connectionData.qrcode

            // Atualiza o status da conexão no banco
            await supabaseClient
              .from('agent_connections')
              .upsert({
                agent_id,
                platform: 'whatsapp',
                is_active: false,
                connection_data: { status: 'awaiting_scan', qr }
              })

            return new Response(
              JSON.stringify({ success: true, qrcode: qr, status: 'awaiting_scan' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ success: true, status: connectionData.state || 'unknown' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error(`Erro ao processar conexão: ${error.message}`)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Erro ao processar conexão: ${error.message}`,
              details: error.stack || JSON.stringify(error)
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }
      }

      case 'status': {
        try {
          // Verificar o status da conexão
          const statusResult = await checkInstanceStatus()
          if (!statusResult.success) {
            return new Response(
              JSON.stringify({ success: false, error: statusResult.error }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
          }

          const statusData = statusResult.data
          
          if (statusData.state === 'open') {
            // Se o estado for "open", a instância está conectada
            await supabaseClient
              .from('agent_connections')
              .upsert({
                agent_id,
                platform: 'whatsapp',
                is_active: true,
                connection_data: { status: 'connected' }
              })

            return new Response(
              JSON.stringify({ success: true, status: 'connected' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Se não estiver conectado, tenta obter novo QR code
          const qrCodeResult = await getQRCode()
          if (!qrCodeResult.success) {
            return new Response(
              JSON.stringify({ success: false, error: qrCodeResult.error }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
          }

          const qrData = qrCodeResult.data
          
          if (qrData.qrcode) {
            const qr = qrData.qrcode.split(',')[1] || qrData.qrcode
            return new Response(
              JSON.stringify({ success: true, qrcode: qr, status: 'awaiting_scan' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ success: true, status: statusData.state }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error(`Erro ao verificar status: ${error.message}`)
          return new Response(
            JSON.stringify({ success: false, error: `Erro ao verificar status: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }
      }

      case 'send': {
        if (!phone) {
          return new Response(
            JSON.stringify({ success: false, error: "Número de telefone não fornecido" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }

        try {
          const sendResponse = await fetchWithErrorHandling(`${EVOLUTION_API_URL}/message/text/${instanceName}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': EVOLUTION_API_KEY
            },
            body: JSON.stringify({
              number: phone,
              text: message
            })
          });

          if (!sendResponse.success) {
            return new Response(
              JSON.stringify({ success: false, error: sendResponse.error }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
          }

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error(`Erro ao enviar mensagem: ${error.message}`)
          return new Response(
            JSON.stringify({ success: false, error: `Erro ao enviar mensagem: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }
      }

      case 'disconnect': {
        try {
          const logoutResult = await fetchWithErrorHandling(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': EVOLUTION_API_KEY
            }
          });

          if (!logoutResult.success) {
            return new Response(
              JSON.stringify({ success: false, error: logoutResult.error }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
          }

          const deleteResult = await fetchWithErrorHandling(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'apikey': EVOLUTION_API_KEY
            }
          });

          if (!deleteResult.success) {
            return new Response(
              JSON.stringify({ success: false, error: deleteResult.error }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
          }

          await supabaseClient
            .from('agent_connections')
            .upsert({
              agent_id,
              platform: 'whatsapp',
              is_active: false,
              connection_data: { status: 'disconnected' }
            })

          return new Response(
            JSON.stringify({ success: true, status: 'disconnected' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error(`Erro ao desconectar instância: ${error.message}`)
          return new Response(
            JSON.stringify({ success: false, error: `Erro ao desconectar instância: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Ação inválida" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error(`Erro geral: ${error.message}`)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Erro interno: ${error.message}`,
        details: error.stack || JSON.stringify(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
