
import { createResponse, callEvolutionAPI, getCredentials } from "../../utils.ts";

// Handler for checking status
export async function handleStatus(
  connection_id: string,
  supabaseClient: any,
  credentials?: { apiUrl?: string; apiKey?: string }
) {
  try {
    const instanceName = `conn_${connection_id}`;
    const { evolutionApiUrl, evolutionApiKey } = await getCredentials(credentials);
    
    console.log(`Checking status for instance: ${instanceName}`);
    
    // Tentar obter estado da conexão
    let statusData;
    try {
      statusData = await callEvolutionAPI(
        evolutionApiUrl,
        `instance/connectionState/${instanceName}`,
        evolutionApiKey
      );
      
      console.log("Status data:", statusData);
    } catch (statusError) {
      console.error("Error checking connection state:", statusError);
      // Continue to QR code fetch attempt
      statusData = { state: 'disconnected' };
    }
    
    if (statusData.state === 'open' || statusData.state === 'connected') {
      await supabaseClient
        .from('agent_connections')
        .update({
          is_active: true,
          connection_data: { status: 'connected' }
        })
        .eq('id', connection_id);

      return createResponse({ 
        success: true,
        status: 'connected' 
      });
    }

    // Se não estiver conectado, tenta obter novo QR code
    console.log(`Getting QR code for instance: ${instanceName}`);
    
    try {
      const qrData = await callEvolutionAPI(
        evolutionApiUrl,
        `instance/qrcode/${instanceName}`,
        evolutionApiKey
      );
      
      console.log("QR code data:", qrData);
      
      if (qrData.qrcode) {
        let qr = qrData.qrcode;
        
        // Processamento do QR code para padronizar formato
        if (typeof qr === 'string') {
          // Se for string com prefixo data:image, remover
          if (qr.includes('data:image')) {
            qr = qr.split(',')[1];
          }
        } else if (typeof qr === 'object') {
          // Se for objeto, extrair base64
          if (qr.base64) {
            qr = qr.base64;
            if (qr.includes('data:image')) {
              qr = qr.split(',')[1];
            }
          }
        }
        
        console.log("QR code processado:", qr.substring(0, 30) + "...");
        
        await supabaseClient
          .from('agent_connections')
          .update({
            is_active: false,
            connection_data: { status: 'awaiting_scan', qr }
          })
          .eq('id', connection_id);
          
        return createResponse({ 
          success: true,
          qr, 
          status: 'awaiting_scan' 
        });
      }
    } catch (qrError) {
      console.warn("Could not get QR code:", qrError);
      // Continue with current status
    }

    return createResponse({ 
      success: true,
      status: statusData.state || 'unknown' 
    });
  } catch (error) {
    console.error("Error in status check:", error);
    return createResponse({
      success: false,
      error: error.message || "Erro desconhecido",
      details: error.toString()
    }, 500);
  }
}
