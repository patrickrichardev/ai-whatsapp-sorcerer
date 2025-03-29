
import { createResponse, callEvolutionAPI, getCredentials } from "../../utils.ts";

// Handler for disconnecting
export async function handleDisconnect(
  connection_id: string,
  supabaseClient: any,
  credentials?: { apiUrl?: string; apiKey?: string }
) {
  try {
    const instanceName = `conn_${connection_id}`;
    const { evolutionApiUrl, evolutionApiKey } = await getCredentials(credentials);
    
    try {
      // Add debug logs for logout URL
      console.log('[DEBUG] baseUrl:', evolutionApiUrl);
      console.log('[DEBUG] endpoint:', `instance/logout/${instanceName}`);
      console.log('[DEBUG] Final URL:', `${evolutionApiUrl}/instance/logout/${instanceName}`);
      
      // Endpoint correto sem "manager/"
      await callEvolutionAPI(
        evolutionApiUrl,
        `instance/logout/${instanceName}`,
        evolutionApiKey,
        'POST'
      );
    } catch (logoutError) {
      console.warn(`Warning: Logout failed: ${logoutError.message}`);
      // Continue with deletion even if logout failed
    }

    try {
      // Add debug logs for delete URL
      console.log('[DEBUG] baseUrl:', evolutionApiUrl);
      console.log('[DEBUG] endpoint:', `instance/delete/${instanceName}`);
      console.log('[DEBUG] Final URL:', `${evolutionApiUrl}/instance/delete/${instanceName}`);
      
      // Endpoint correto sem "manager/"
      await callEvolutionAPI(
        evolutionApiUrl,
        `instance/delete/${instanceName}`,
        evolutionApiKey,
        'DELETE'
      );
    } catch (deleteError) {
      console.warn(`Warning: Delete instance failed: ${deleteError.message}`);
      // Continue with the process even if deletion failed
    }

    await supabaseClient
      .from('agent_connections')
      .update({
        is_active: false,
        connection_data: { status: 'disconnected' }
      })
      .eq('id', connection_id);

    return createResponse({ 
      success: true,
      status: 'disconnected' 
    });
  } catch (error) {
    return createResponse({
      success: false,
      error: error.message || "Erro desconhecido",
      details: error.toString()
    }, 500);
  }
}
