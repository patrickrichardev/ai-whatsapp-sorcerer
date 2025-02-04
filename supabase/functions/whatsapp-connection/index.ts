import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import { Venom } from 'npm:@wppconnect-team/wppconnect@1.29.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const clients: { [key: string]: any } = {}

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

    const { action, agent_id } = await req.json()
    const connectionKey = `agent_${agent_id}`

    switch (action) {
      case 'connect': {
        if (!clients[connectionKey]) {
          const client = await Venom.create({
            session: connectionKey,
            catchQR: (qr) => {
              clients[connectionKey].qr = qr
              clients[connectionKey].status = 'awaiting_scan'
              
              // Update status in database
              supabaseClient
                .from('agent_connections')
                .upsert({
                  agent_id,
                  platform: 'whatsapp',
                  is_active: false,
                  connection_data: { status: 'awaiting_scan', qr }
                })
            },
            statusFind: (status) => {
              console.log('Status:', status)
              if (status === 'isLogged') {
                clients[connectionKey].status = 'connected'
                
                // Update status in database
                supabaseClient
                  .from('agent_connections')
                  .upsert({
                    agent_id,
                    platform: 'whatsapp',
                    is_active: true,
                    connection_data: { status: 'connected' }
                  })
              }
            }
          })

          clients[connectionKey] = {
            client,
            qr: null,
            status: 'initializing'
          }
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

      case 'disconnect': {
        if (clients[connectionKey]) {
          await clients[connectionKey].client.close()
          delete clients[connectionKey]

          await supabaseClient
            .from('agent_connections')
            .upsert({
              agent_id,
              platform: 'whatsapp',
              is_active: false,
              connection_data: { status: 'disconnected' }
            })
        }

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