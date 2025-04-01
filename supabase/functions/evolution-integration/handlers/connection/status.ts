
import { createResponse, createErrorResponse, callEvolutionAPI, getCredentials } from "../../utils.ts";

// Handler for checking WhatsApp instance status
export async function handleStatus(
  connection_id: string, 
  supabaseClient: any,
  credentials?: { apiUrl?: string; apiKey?: string }
) {
  try {
    if (!connection_id) {
      return createErrorResponse("Connection ID is required", 400);
    }
    
    // Get cached connection data first
    const { data: connection, error: connectionError } = await supabaseClient
      .from('agent_connections')
      .select('*')
      .eq('id', connection_id)
      .single();
    
    if (connectionError) {
      throw new Error(`Error fetching connection data: ${connectionError.message}`);
    }
    
    if (!connection) {
      return createErrorResponse(`Connection not found: ${connection_id}`, 404);
    }
    
    const instanceName = `conn_${connection_id}`;
    const { evolutionApiUrl, evolutionApiKey } = await getCredentials(credentials);
    
    console.log(`Checking connection status for ${instanceName}`);
    
    // Check connection status
    try {
      const statusResponse = await callEvolutionAPI(
        evolutionApiUrl,
        `instance/connectionState/${instanceName}`,
        evolutionApiKey,
        'GET'
      );
      
      console.log("Connection status response:", statusResponse);
      
      if (statusResponse && statusResponse.state === 'open') {
        // If connected, update database and return status
        await supabaseClient
          .from('agent_connections')
          .update({
            is_active: true,
            connection_data: { 
              ...connection.connection_data,
              status: 'connected' 
            }
          })
          .eq('id', connection_id);
        
        return createResponse({
          success: true,
          status: 'connected'
        });
      }
      
      // If not connected, check if we need a new QR code
      if (statusResponse && statusResponse.state !== 'open') {
        try {
          // Attempt to get QR code
          const qrResponse = await callEvolutionAPI(
            evolutionApiUrl,
            `instance/qrcode/${instanceName}`,
            evolutionApiKey,
            'GET'
          );
          
          console.log("QR code response:", qrResponse);
          
          if (qrResponse && qrResponse.qrcode) {
            // Extract QR code data
            const qr = qrResponse.qrcode.split(',')[1] || qrResponse.qrcode;
            
            // Update connection with new QR code
            await supabaseClient
              .from('agent_connections')
              .update({
                is_active: false,
                connection_data: {
                  ...connection.connection_data,
                  status: 'awaiting_scan',
                  qr
                }
              })
              .eq('id', connection_id);
            
            return createResponse({
              success: true,
              status: 'awaiting_scan',
              qr
            });
          }
        } catch (error) {
          console.error("Error fetching QR code:", error);
          // Continue processing, QR code fetch error is not fatal
        }
        
        // If we get here, return the connection state from the API
        return createResponse({
          success: true,
          status: statusResponse.state,
          details: "Instance exists but is not connected"
        });
      }
      
      // Default response if statusResponse exists but none of the conditions matched
      return createResponse({
        success: true,
        status: statusResponse.state || 'unknown',
        details: "Connection status indeterminate"
      });
      
    } catch (error) {
      console.error("Error checking connection status:", error);
      
      // Check if the error might be because the instance doesn't exist
      if (error.message && error.message.includes('404')) {
        console.log("Instance not found, it may need to be created");
        
        // Update connection to reflect it needs creation
        await supabaseClient
          .from('agent_connections')
          .update({
            is_active: false,
            connection_data: {
              ...connection.connection_data,
              status: 'needs_creation'
            }
          })
          .eq('id', connection_id);
        
        return createResponse({
          success: true,
          status: 'needs_creation',
          details: "Instance needs to be created first"
        });
      }
      
      // For other errors
      return createErrorResponse(
        `Error checking connection status: ${error.message}`,
        500
      );
    }
  } catch (error) {
    console.error("Error in status handler:", error);
    return createErrorResponse(
      `Error processing status request: ${error.message}`,
      500
    );
  }
}
