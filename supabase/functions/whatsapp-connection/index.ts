import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
        // Simulate QR code generation for now
        const mockQrCode = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

        // Update connection status in database
        await supabase
          .from('agent_connections')
          .upsert({
            agent_id,
            platform: 'whatsapp',
            is_active: false,
            connection_data: { status: 'awaiting_qr' }
          })

        return new Response(
          JSON.stringify({ qr: mockQrCode }),
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