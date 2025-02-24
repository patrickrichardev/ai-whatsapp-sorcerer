
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
          console.log('Iniciando nova conexão para:', connectionKey)
          
          try {
            const client = await wppconnect.create({
              session: connectionKey,
              catchQR: async (base64Qr, asciiQR, attempt) => {
                console.log('QR Code gerado - Tentativa:', attempt)
                if (clients[connectionKey]) {
                  clients[connectionKey].qr = base64Qr
                  clients[connectionKey].status = 'awaiting_scan'
                }
                
                await supabaseClient
                  .from('agent_connections')
                  .upsert({
                    agent_id,
                    platform: 'whatsapp',
                    is_active: false,
                    connection_data: { status: 'awaiting_scan', qr: base64Qr }
                  })
              },
              logQR: false,
              puppeteerOptions: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
              }
            })

            console.log('Cliente criado com sucesso')

            client.onStateChange(async (state) => {
              console.log('Estado atual:', state)
              if (state === 'CONNECTED') {
                if (clients[connectionKey]) {
                  clients[connectionKey].status = 'connected'
                }
                
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

            client.onMessage(async (message) => {
              if (message.from === 'status@broadcast') return
              console.log('Mensagem recebida:', message.from)

              try {
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
                      name: message.sender.pushname || message.from,
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
              } catch (error) {
                console.error('Erro ao processar mensagem:', error)
              }
            })

            clients[connectionKey] = {
              client,
              qr: null,
              status: 'initializing'
            }

            console.log('Cliente configurado e armazenado')
          } catch (error) {
            console.error('Erro ao criar cliente:', error)
            throw error
          }
        }

        return new Response(
          JSON.stringify({ 
            qr: clients[connectionKey]?.qr,
            status: clients[connectionKey]?.status 
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
