
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

// Configuração de cabeçalhos CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Obtenha as variáveis de ambiente
const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL') || ''
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY') || ''

console.log(`Usando EVOLUTION_API_URL: ${EVOLUTION_API_URL}`)
console.log(`Usando EVOLUTION_API_KEY (primeiros 5 caracteres): ${EVOLUTION_API_KEY.substring(0, 5)}...`)

if (!EVOLUTION_API_URL) {
  console.error("EVOLUTION_API_URL não está configurada!")
}

if (!EVOLUTION_API_KEY) {
  console.error("EVOLUTION_API_KEY não está configurada!")
}

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
    console.log(`Processando action: ${action}, agent_id: ${agent_id || "N/A"}`)

    // Validação básica de URL e API key
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Configuração incompleta. EVOLUTION_API_URL ou EVOLUTION_API_KEY não configurados.", 
          diagnostics: {
            apiUrl: EVOLUTION_API_URL ? "Configurada" : "Não configurada",
            apiKey: EVOLUTION_API_KEY ? "Configurada" : "Não configurada"
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (!agent_id && action !== 'send' && action !== 'test_connection') {
      return new Response(
        JSON.stringify({ success: false, error: "ID do agente não fornecido" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Nome da instância baseado no ID do agente
    const instanceName = agent_id ? `agent_${agent_id}` : "test_instance"

    // Funções auxiliares para lidar com as chamadas à Evolution API
    async function fetchWithErrorHandling(url, options = {}) {
      console.log(`Enviando requisição para: ${url}`)
      
      try {
        // Adiciona timeout para evitar requisições pendentes infinitas
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos
        
        const fetchOptions = {
          ...options,
          signal: controller.signal
        };
        
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);
        
        // Registra o status da resposta
        console.log(`Resposta recebida com status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Erro HTTP ${response.status}: ${errorText}`);
          
          return { 
            success: false, 
            error: `Erro HTTP ${response.status}`, 
            details: errorText,
            diagnostics: {
              apiUrl: url,
              requestData: options.body ? JSON.parse(options.body) : null,
              responseStatus: response.status
            }
          };
        }
        
        // Tenta processar como JSON
        const text = await response.text();
        
        // Se o texto estiver vazio, retorna erro
        if (!text.trim()) {
          return { 
            success: false, 
            error: "Resposta vazia da API", 
            diagnostics: {
              apiUrl: url,
              requestData: options.body ? JSON.parse(options.body) : null,
              responseStatus: response.status
            }
          };
        }
        
        // Verifica se o texto é HTML
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          console.error("A resposta recebida é HTML e não JSON:");
          console.error(text.substring(0, 200) + "...");
          
          return { 
            success: false, 
            error: "A resposta recebida é HTML e não JSON. Verifique a URL da API.", 
            details: text.substring(0, 500),
            diagnostics: {
              apiUrl: url,
              requestData: options.body ? JSON.parse(options.body) : null,
              responseStatus: response.status
            }
          };
        }
        
        try {
          return { success: true, data: JSON.parse(text) };
        } catch (e) {
          console.error(`Erro ao processar JSON: ${e.message}`);
          console.error(`Resposta não-JSON recebida: ${text.substring(0, 200)}...`);
          
          return { 
            success: false, 
            error: `Não foi possível processar a resposta como JSON: ${e.message}`, 
            details: text.substring(0, 500),
            diagnostics: {
              apiUrl: url,
              requestData: options.body ? JSON.parse(options.body) : null,
              responseStatus: response.status
            }
          };
        }
      } catch (error) {
        console.error(`Erro na requisição: ${error.message}`);
        
        // Verifica se foi timeout
        if (error.name === 'AbortError') {
          return { 
            success: false, 
            error: "Timeout: A requisição excedeu o tempo limite de 8 segundos",
            diagnostics: {
              apiUrl: url,
              requestData: options.body ? JSON.parse(options.body) : null
            }
          };
        }
        
        return { 
          success: false, 
          error: error.message,
          details: `URL: ${url}, Método: ${options.method || 'GET'}`,
          diagnostics: {
            apiUrl: url,
            requestData: options.body ? JSON.parse(options.body) : null
          }
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
          token: agent_id || "test_token",
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

    async function testApiConnection() {
      console.log(`Testando conexão com a API Evolution`);

      // Primeiro, vamos tentar uma requisição GET simples para verificar se a API está acessível
      return await fetchWithErrorHandling(`${EVOLUTION_API_URL}/instance/info`, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        }
      });
    }

    // Processar a ação solicitada
    switch (action) {
      case 'test_connection': {
        const testResult = await testApiConnection();
        
        if (!testResult.success) {
          return new Response(
            JSON.stringify(testResult),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Conexão com a Evolution API estabelecida com sucesso",
            details: testResult.data
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'connect': {
        try {
          // Tentar criar a instância
          const createInstanceResult = await createInstance()
          if (!createInstanceResult.success) {
            return new Response(
              JSON.stringify(createInstanceResult),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
          }

          // Tenta conectar a instância
          const connectResult = await connectInstance()
          if (!connectResult.success) {
            return new Response(
              JSON.stringify(connectResult),
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
              JSON.stringify(statusResult),
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
              JSON.stringify(qrCodeResult),
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
              JSON.stringify(sendResponse),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
          }

          return new Response(
            JSON.stringify({ success: true, message: "Mensagem enviada com sucesso" }),
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
              JSON.stringify(logoutResult),
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
              JSON.stringify(deleteResult),
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
