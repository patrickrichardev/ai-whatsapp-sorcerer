
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

// Configuração de cabeçalhos CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configure aqui a URL do seu servidor Evolution API
const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL') || 'http://localhost:8080'
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY') || 'your-api-key'

console.log(`Usando EVOLUTION_API_URL: ${EVOLUTION_API_URL}`)

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

    if (!agent_id) {
      return new Response(
        JSON.stringify({ success: false, error: "ID do agente não fornecido" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Nome da instância baseado no ID do agente
    const instanceName = `agent_${agent_id}`

    // Funções auxiliares para lidar com as chamadas à Evolution API
    async function createInstance() {
      console.log(`Criando instância: ${instanceName}`)
      try {
        const createResponse = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
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
        })

        // Log da resposta completa para debug
        const rawResponse = await createResponse.text()
        console.log(`Resposta raw da criação de instância: ${rawResponse}`)

        let responseData
        try {
          responseData = JSON.parse(rawResponse)
        } catch (e) {
          console.error(`Erro ao parsear resposta da criação de instância: ${e.message}`)
          console.error(`Conteúdo da resposta: ${rawResponse}`)
          
          // Verificar se a resposta contém HTML ou outros erros
          if (rawResponse.includes('<!DOCTYPE') || rawResponse.includes('<html>')) {
            return { success: false, error: "Servidor Evolution API retornou HTML ao invés de JSON. Verifique a URL e o acesso ao servidor." }
          }
          
          return { success: false, error: `Resposta inválida do servidor: ${e.message}` }
        }

        return { success: true, data: responseData }
      } catch (error) {
        console.error(`Erro ao criar instância: ${error.message}`)
        return { success: false, error: `Falha ao criar instância: ${error.message}` }
      }
    }

    async function connectInstance() {
      console.log(`Conectando instância: ${instanceName}`)
      try {
        const connectResponse = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY
          }
        })

        // Log da resposta completa para debug
        const rawResponse = await connectResponse.text()
        console.log(`Resposta raw da conexão de instância: ${rawResponse}`)

        let responseData
        try {
          responseData = JSON.parse(rawResponse)
        } catch (e) {
          console.error(`Erro ao parsear resposta da conexão de instância: ${e.message}`)
          console.error(`Conteúdo da resposta: ${rawResponse}`)
          
          // Verificar se a resposta contém HTML ou outros erros
          if (rawResponse.includes('<!DOCTYPE') || rawResponse.includes('<html>')) {
            return { success: false, error: "Servidor Evolution API retornou HTML ao invés de JSON. Verifique a URL e o acesso ao servidor." }
          }
          
          return { success: false, error: `Resposta inválida do servidor: ${e.message}` }
        }

        return { success: true, data: responseData }
      } catch (error) {
        console.error(`Erro ao conectar instância: ${error.message}`)
        return { success: false, error: `Falha ao conectar instância: ${error.message}` }
      }
    }

    async function checkInstanceStatus() {
      console.log(`Verificando status da instância: ${instanceName}`)
      try {
        const statusResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY
          }
        })

        // Log da resposta completa para debug
        const rawResponse = await statusResponse.text()
        console.log(`Resposta raw do status de instância: ${rawResponse}`)

        let responseData
        try {
          responseData = JSON.parse(rawResponse)
        } catch (e) {
          console.error(`Erro ao parsear resposta do status de instância: ${e.message}`)
          console.error(`Conteúdo da resposta: ${rawResponse}`)
          
          // Verificar se a resposta contém HTML ou outros erros
          if (rawResponse.includes('<!DOCTYPE') || rawResponse.includes('<html>')) {
            return { success: false, error: "Servidor Evolution API retornou HTML ao invés de JSON. Verifique a URL e o acesso ao servidor." }
          }
          
          return { success: false, error: `Resposta inválida do servidor: ${e.message}` }
        }

        return { success: true, data: responseData }
      } catch (error) {
        console.error(`Erro ao verificar status da instância: ${error.message}`)
        return { success: false, error: `Falha ao verificar status da instância: ${error.message}` }
      }
    }

    async function getQRCode() {
      console.log(`Obtendo QR code da instância: ${instanceName}`)
      try {
        const qrResponse = await fetch(`${EVOLUTION_API_URL}/instance/qrcode/${instanceName}`, {
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY
          }
        })

        // Log da resposta completa para debug
        const rawResponse = await qrResponse.text()
        console.log(`Resposta raw do QR code: ${rawResponse}`)

        let responseData
        try {
          responseData = JSON.parse(rawResponse)
        } catch (e) {
          console.error(`Erro ao parsear resposta do QR code: ${e.message}`)
          console.error(`Conteúdo da resposta: ${rawResponse}`)
          
          // Verificar se a resposta contém HTML ou outros erros
          if (rawResponse.includes('<!DOCTYPE') || rawResponse.includes('<html>')) {
            return { success: false, error: "Servidor Evolution API retornou HTML ao invés de JSON. Verifique a URL e o acesso ao servidor." }
          }
          
          return { success: false, error: `Resposta inválida do servidor: ${e.message}` }
        }

        return { success: true, data: responseData }
      } catch (error) {
        console.error(`Erro ao obter QR code da instância: ${error.message}`)
        return { success: false, error: `Falha ao obter QR code: ${error.message}` }
      }
    }

    // Processar a ação solicitada
    switch (action) {
      case 'connect': {
        try {
          // Tentar criar a instância
          const createInstanceResult = await createInstance()
          if (!createInstanceResult.success) {
            return new Response(
              JSON.stringify({ success: false, error: createInstanceResult.error }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
          }

          // Tenta conectar a instância
          const connectResult = await connectInstance()
          if (!connectResult.success) {
            return new Response(
              JSON.stringify({ success: false, error: connectResult.error }),
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
              JSON.stringify({ success: true, qr, status: 'awaiting_scan' }),
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
            JSON.stringify({ success: false, error: `Erro ao processar conexão: ${error.message}` }),
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
              JSON.stringify({ success: true, qr, status: 'awaiting_scan' }),
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
            const errorText = await sendResponse.text()
            throw new Error(`Falha ao enviar mensagem: ${errorText}`)
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
          const logoutResponse = await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': EVOLUTION_API_KEY
            }
          })

          if (!logoutResponse.ok) {
            const errorText = await logoutResponse.text()
            throw new Error(`Falha ao desconectar: ${errorText}`)
          }

          const deleteResponse = await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'apikey': EVOLUTION_API_KEY
            }
          })

          if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text()
            throw new Error(`Falha ao deletar instância: ${errorText}`)
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
      JSON.stringify({ success: false, error: `Erro interno: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
