
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "./config.ts"
import { createSupabaseClient, createErrorResponse } from "./utils.ts"
import { 
  handleUpdateCredentials,
  handleTestConnection,
  handleConnect,
  handleStatus,
  handleSend,
  handleDisconnect
} from "./handlers/index.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createSupabaseClient(req)
    
    // Parse request data
    let requestData;
    try {
      requestData = await req.json()
    } catch (error) {
      console.error("Failed to parse request JSON:", error);
      return createErrorResponse("Invalid JSON in request body", 400);
    }
    
    const { action, connection_id, phone, message, credentials } = requestData
    
    console.log(`Processing action: ${action}, connection_id: ${connection_id || 'none'}`);
    
    switch (action) {
      case "update_credentials":
        return await handleUpdateCredentials(credentials)

      case "test_connection":
        return await handleTestConnection(credentials)

      case 'connect':
        return await handleConnect(connection_id, supabaseClient, credentials)

      case 'status':
        return await handleStatus(connection_id, supabaseClient, credentials)

      case 'send':
        return await handleSend(connection_id, phone, message, credentials)

      case 'disconnect':
        return await handleDisconnect(connection_id, supabaseClient, credentials)

      default:
        console.error(`Invalid action requested: ${action}`);
        return createErrorResponse('Invalid action', 400)
    }
  } catch (error) {
    console.error('Error in edge function:', error)
    return createErrorResponse(error.message || "Unknown error occurred")
  }
})
