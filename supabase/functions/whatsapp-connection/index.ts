import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import { makeWASocket, DisconnectReason } from "npm:@whiskeysockets/baileys@5.0.0"
import { Boom } from "npm:@hapi/boom@10.0.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Armazenamento temporário para os sockets e QR codes
const connections: { [key: string]: any } = {}
const qrCodes: { [key: string]: string } = {}

serve(async (req) => {
  // Handle CORS
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
        // Se já existe uma conexão, retorna o QR code existente
        if (qrCodes[connectionKey]) {
          return new Response(
            JSON.stringify({ qr: qrCodes[connectionKey] }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Cria nova conexão
        const sock = makeWASocket({
          printQRInTerminal: true,
          browser: ['Chrome (Linux)', '', ''],
        })

        connections[connectionKey] = sock

        // Gerencia eventos da conexão
        sock.ev.on('connection.update', async (update) => {
          const { connection, lastDisconnect, qr } = update

          if (qr) {
            console.log('QR Code atualizado:', qr)
            qrCodes[connectionKey] = qr

            // Atualiza o status da conexão no banco
            await supabase
              .from('agent_connections')
              .upsert({
                agent_id,
                platform: 'whatsapp',
                is_active: false,
                connection_data: { status: 'awaiting_qr' }
              })
          }

          if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            
            if (shouldReconnect) {
              console.log('Reconectando...')
              delete connections[connectionKey]
              delete qrCodes[connectionKey]
            }
          } else if (connection === 'open') {
            console.log('Conexão estabelecida!')
            delete qrCodes[connectionKey]

            // Atualiza o status da conexão no banco
            await supabase
              .from('agent_connections')
              .upsert({
                agent_id,
                platform: 'whatsapp',
                is_active: true,
                connection_data: { 
                  status: 'connected',
                  phone: sock.user?.id?.split(':')[0]
                }
              })
          }
        })

        // Aguarda o QR code ser gerado
        let attempts = 0
        while (!qrCodes[connectionKey] && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          attempts++
        }

        return new Response(
          JSON.stringify({ qr: qrCodes[connectionKey] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'status': {
        const connection = await supabase
          .from('agent_connections')
          .select('*')
          .eq('agent_id', agent_id)
          .eq('platform', 'whatsapp')
          .single()

        return new Response(
          JSON.stringify({ status: connection.data?.is_active ? 'connected' : 'disconnected' }),
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