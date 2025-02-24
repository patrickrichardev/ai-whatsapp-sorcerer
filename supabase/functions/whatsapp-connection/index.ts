
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import * as wppconnect from "npm:@wppconnect-team/wppconnect@1.29.0"

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
          // Criar uma nova sessão do WPPConnect
          const client = await wppconnect.create({
            session: connectionKey,
            catchQR: async (base64Qr) => {
              console.log('QR Code gerado')
              clients[connectionKey].qr = base64Qr
              clients[connectionKey].status = 'awaiting_scan'
              
              // Atualizar status no banco de dados
              await supabaseClient
                .from('agent_connections')
                .upsert({
                  agent_id,
                  platform: 'whatsapp',
                  is_active: false,
                  connection_data: { status: 'awaiting_scan', qr: base64Qr }
                })
            },
            statusFind: (statusSession) => {
              console.log('Status da sessão:', statusSession)
            }
          })

          // Quando autenticado com sucesso
          client.onStateChange(async (state) => {
            if (state === wppconnect.SocketState.CONNECTED) {
              console.log('WhatsApp conectado!')
              clients[connectionKey].status = 'connected'
              
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

          // Quando receber mensagem
          client.onMessage(async (message) => {
            if (message.from === 'status@broadcast') return

            // Buscar ou criar conversa
            const { data: existingChat } = await supabaseClient
              .from('chat_conversations')
              .select()
              .eq('customer_phone', message.from)
              .single()

            let chatId
            if (!existingChat) {
              const { data: newChat } = await supabaseClient
                .from('chat_conversations')
                .insert({
                  agent_id,
                  customer_phone: message.from,
                  customer_name: message.sender.pushname || message.from,
                  status: 'open',
                  last_message: message.body,
                  unread_count: 1
                })
                .select()
                .single()
              
              chatId = newChat?.id
            } else {
              chatId = existingChat.id
              await supabaseClient
                .from('chat_conversations')
                .update({
                  last_message: message.body,
                  unread_count: (existingChat.unread_count || 0) + 1,
                  updated_at: new Date().toISOString()
                })
                .eq('id', chatId)
            }

            // Salvar mensagem
            await supabaseClient
              .from('chat_messages')
              .insert({
                chat_id: chatId,
                content: message.body,
                sender_type: 'customer',
                metadata: {
                  whatsapp_message_id: message.id,
                  media_type: message.type
                }
              })
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

      case 'send': {
        const { phone, message } = await req.json()
        const client = clients[connectionKey]?.client

        if (!client) {
          throw new Error('WhatsApp client not initialized')
        }

        await client.sendText(phone, message)
        
        return new Response(
          JSON.stringify({ success: true }),
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
