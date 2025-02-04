import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import { Client } from "npm:whatsapp-web.js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const clients: { [key: string]: any } = {}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.split(' ')[1] ?? ''
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { action, agent_id } = await req.json()
    const connectionKey = `${user.id}:${agent_id}`

    console.log(`Processing ${action} for connection ${connectionKey}`)

    switch (action) {
      case 'connect': {
        // Inicializa o cliente do WhatsApp se ainda não existir
        if (!clients[connectionKey]) {
          clients[connectionKey] = {
            client: new Client({}),
            qr: null,
            status: 'initializing'
          }

          const client = clients[connectionKey].client

          client.on('qr', (qr: string) => {
            console.log('QR Code received:', qr)
            clients[connectionKey].qr = qr
            clients[connectionKey].status = 'awaiting_scan'
          })

          client.on('ready', async () => {
            console.log('Client is ready!')
            clients[connectionKey].status = 'connected'
            
            // Atualiza o status no banco de dados
            await supabase
              .from('agent_connections')
              .upsert({
                agent_id,
                platform: 'whatsapp',
                is_active: true,
                connection_data: { status: 'connected' }
              })
          })

          client.on('disconnected', async () => {
            console.log('Client disconnected')
            clients[connectionKey].status = 'disconnected'
            
            // Atualiza o status no banco de dados
            await supabase
              .from('agent_connections')
              .upsert({
                agent_id,
                platform: 'whatsapp',
                is_active: false,
                connection_data: { status: 'disconnected' }
              })
          })

          await client.initialize()
        }

        return new Response(
          JSON.stringify({ 
            qr: clients[connectionKey].qr,
            status: clients[connectionKey].status 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'status': {
        const connection = clients[connectionKey]
        return new Response(
          JSON.stringify({ 
            status: connection?.status || 'disconnected',
            qr: connection?.qr 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})