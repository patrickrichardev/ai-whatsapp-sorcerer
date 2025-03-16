import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Default credentials that will be overridden if custom ones are provided
const DEFAULT_EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL') || 'http://localhost:8080'
const DEFAULT_EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY') || 'your-api-key'

// Helper to store custom credentials temporarily (in a real-world scenario, you'd store this in a database)
let customCredentials: { apiUrl?: string; apiKey?: string } = {}

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

    const requestData = await req.json()
    const { action, agent_id, phone, message, credentials } = requestData
    
    // Use custom credentials if provided in the request, otherwise use default or previously stored custom credentials
    const evolutionApiUrl = credentials?.apiUrl || customCredentials.apiUrl || DEFAULT_EVOLUTION_API_URL
    const evolutionApiKey = credentials?.apiKey || customCredentials.apiKey || DEFAULT_EVOLUTION_API_KEY
    
    console.log(`Using Evolution API URL: ${evolutionApiUrl}`)
    console.log(`Using Evolution API Key: ${evolutionApiKey ? '***' + evolutionApiKey.slice(-4) : 'none'}`)

    if (action === "update_credentials") {
      if (!credentials || !credentials.apiUrl || !credentials.apiKey) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Credenciais inválidas" 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      // Store the custom credentials
      customCredentials = {
        apiUrl: credentials.apiUrl,
        apiKey: credentials.apiKey
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Credenciais atualizadas com sucesso" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === "test_connection") {
      try {
        // Test connection to Evolution API
        const response = await fetch(`${evolutionApiUrl}/instance/info`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionApiKey
          },
          // Use AbortController to set a timeout
          signal: AbortSignal.timeout(10000) // 10 second timeout
        })
        
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`)
        }
        
        const data = await response.json()
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Conexão com a Evolution API estabelecida com sucesso",
            data
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error("Erro ao testar conexão:", error)
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Falha ao conectar: ${error.message}`,
            diagnostics: {
              apiUrl: evolutionApiUrl,
              error: error.toString()
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // For actions that require an instanceName
    const instanceName = agent_id ? `agent_${agent_id}` : undefined

    switch (action) {
      case 'connect': {
        if (!instanceName) {
          throw new Error('ID do agente não fornecido')
        }
        
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
          })

          if (!createInstanceResponse.ok) {
            throw new Error('Falha ao criar instância')
          }

          // Conectar instância
          const connectResponse = await fetch(`${evolutionApiUrl}/instance/connect/${instanceName}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': evolutionApiKey
            }
          })

          const connectionData = await connectResponse.json()
          
          if (connectionData.qrcode) {
            // Remove o prefixo "data:image/png;base64," do QR code
            const qr = connectionData.qrcode.split(',')[1] || connectionData.qrcode

            await supabaseClient
              .from('agent_connections')
              .upsert({
                agent_id,
                platform: 'whatsapp',
                is_active: false,
                connection_data: { status: 'awaiting_scan', qr }
              })

            return new Response(
              JSON.stringify({ qr, status: 'awaiting_scan' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ status: connectionData.state || 'error' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error('Erro ao conectar:', error)
          throw error
        }
      }

      case 'status': {
        const statusResponse = await fetch(`${evolutionApiUrl}/instance/connectionState/${instanceName}`, {
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionApiKey
          }
        })

        const statusData = await statusResponse.json()
        
        if (statusData.state === 'open') {
          await supabaseClient
            .from('agent_connections')
            .upsert({
              agent_id,
              platform: 'whatsapp',
              is_active: true,
              connection_data: { status: 'connected' }
            })

          return new Response(
            JSON.stringify({ status: 'connected' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Se não estiver conectado, tenta obter novo QR code
        const qrResponse = await fetch(`${evolutionApiUrl}/instance/qrcode/${instanceName}`, {
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionApiKey
          }
        })

        const qrData = await qrResponse.json()
        
        if (qrData.qrcode) {
          const qr = qrData.qrcode.split(',')[1] || qrData.qrcode
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
        const logoutResponse = await fetch(`${evolutionApiUrl}/instance/logout/${instanceName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionApiKey
          }
        })

        if (!logoutResponse.ok) {
          throw new Error('Falha ao desconectar')
        }

        const deleteResponse = await fetch(`${evolutionApiUrl}/instance/delete/${instanceName}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionApiKey
          }
        })

        if (!deleteResponse.ok) {
          throw new Error('Falha ao deletar instância')
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
