import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from 'npm:@whiskeysockets/baileys'
import { Boom } from 'npm:@hapi/boom'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const clients: { [key: string]: any } = {}

serve(async (req) => {
  // Handle CORS preflight requests
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
          const { state, saveCreds } = await useMultiFileAuthState(`auth_${connectionKey}`)
          
          const sock = makeWASocket({
            printQRInTerminal: true,
            auth: state,
          })

          clients[connectionKey] = {
            socket: sock,
            qr: null,
            status: 'initializing'
          }

          sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
            if (qr) {
              console.log('QR Code:', qr)
              clients[connectionKey].qr = qr
              clients[connectionKey].status = 'awaiting_scan'
              
              // Atualiza status no banco
              await supabaseClient
                .from('agent_connections')
                .upsert({
                  agent_id,
                  platform: 'whatsapp',
                  is_active: false,
                  connection_data: { status: 'awaiting_scan', qr }
                })
            }

            if (connection === 'close') {
              const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
              
              if (shouldReconnect) {
                // Reconecta
                clients[connectionKey].status = 'reconnecting'
              } else {
                // Desconectado permanentemente
                clients[connectionKey].status = 'disconnected'
                delete clients[connectionKey]
              }

              // Atualiza status no banco
              await supabaseClient
                .from('agent_connections')
                .upsert({
                  agent_id,
                  platform: 'whatsapp',
                  is_active: false,
                  connection_data: { 
                    status: shouldReconnect ? 'reconnecting' : 'disconnected' 
                  }
                })
            }

            if (connection === 'open') {
              clients[connectionKey].status = 'connected'
              
              // Atualiza status no banco
              await supabaseClient
                .from('agent_connections')
                .upsert({
                  agent_id,
                  platform: 'whatsapp',
                  is_active: true,
                  connection_data: { status: 'connected' }
                })
            }
          })

          sock.ev.on('creds.update', saveCreds)
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
          await clients[connectionKey].socket.logout()
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