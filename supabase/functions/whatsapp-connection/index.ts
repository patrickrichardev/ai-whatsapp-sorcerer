
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
      case 'connect': {
        try {
          // Criar instância se não existir
          const createInstanceResponse = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
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

          if (!createInstanceResponse.ok) {
            throw new Error('Falha ao criar instância')
          }

          // Conectar instância
          const connectResponse = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': EVOLUTION_API_KEY
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
        const statusResponse = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY
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
        const qrResponse = await fetch(`${EVOLUTION_API_URL}/instance/qrcode/${instanceName}`, {
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY
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
