
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "./config.ts"
import { createSupabaseClient, createResponse, createErrorResponse } from "./utils.ts"
import { 
  handleUpdateCredentials,
  handleTestConnection,
  handleConnect,
  handleStatus,
  handleSend,
  handleDisconnect
} from "./handlers.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createSupabaseClient(req)
    const requestData = await req.json()
    const { action, agent_id, phone, message, credentials } = requestData
    
    switch (action) {
      case "update_credentials":
        return await handleUpdateCredentials(credentials)

      case "test_connection":
        return await handleTestConnection(credentials)

      case 'connect':
        return await handleConnect(agent_id, supabaseClient, credentials)

      case 'status':
        return await handleStatus(agent_id, supabaseClient, credentials)

      case 'send':
        return await handleSend(agent_id, phone, message, credentials)

      case 'disconnect':
        return await handleDisconnect(agent_id, supabaseClient, credentials)

      default:
        return createResponse({ error: 'Invalid action' }, 400)
    }
  } catch (error) {
    console.error('Error:', error)
    return createErrorResponse(error.message)
  }
})
